/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const Project = require('../models/projects.model');
const User = require('../models/users.model');
const Reports = require('../models/reports.model');
const {generateProjectReport} = require('../util/ai-report');

const PROJECT_NAME_MAX_LENGTH = 150;
const PROJECT_DESCRIPTION_MAX_LENGTH = 65535;

const isDataTooLongError = (error) => {
  return error && (
    error.code === 'ER_DATA_TOO_LONG' ||
    error.errno === 1406 ||
    error.sqlState === '22001'
  );
};

const formatDateForInput = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
};

const getTodayForInput = () => formatDateForInput(new Date());

const resolveEndDateForStatus = (status, endDate) => {
  if (status === 'completed') {
    return getTodayForInput();
  }

  const normalizedEndDate = (endDate || '').trim();
  return normalizedEndDate || null;
};

const isEndDateBeforeStartDate = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }

  return endDate < startDate;
};

const resolveDefaultTeamId = (request, teams) => {
  const requestedTeamId = (request.query.team_id || '').trim();
  if (requestedTeamId) {
    const requestedTeam = (teams || []).find(
        (team) => String(team.team_id) === String(requestedTeamId),
    );

    if (requestedTeam) {
      return String(requestedTeam.team_id);
    }
  }

  if (teams && teams.length === 1) {
    return String(teams[0].team_id);
  }

  return '';
};

// Helper to get current user ID from session email
const getCurrentUserId = async (request) => {
  const email = request.session.email;
  if (!email) return null;
  const [users] = await User.fetchOne(email);
  if (!users || users.length === 0) return null;
  return users[0].user_id;
};

exports.get_list = async (request, response, next) => {
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      request.session.error = 'Session user not found. Please log in again.';
      return response.redirect('/login');
    }

    const [rows] = await Project.getAllByUserTeams(userId);

    return response.render('projectShow', {
      csrfToken: request.csrfToken(),
      error: error,
      success: success,
      email: request.session.email || '',
      projects: rows,
    });
  } catch (error) {
    console.error('[GET /projects/list] Failed to fetch projects:', error.message);
    return response.render('projectShow', {
      csrfToken: request.csrfToken(),
      error: 'Error loading projects.',
      success: '',
      email: request.session.email || '',
      projects: [],
    });
  }
};

exports.get_add = async (request, response, next) => {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      request.session.error = 'Session user not found. Please log in again.';
      return response.redirect('/login');
    }

    const [rows] = await Project.getTeamsByUser(userId);
    const defaultTeamId = resolveDefaultTeamId(request, rows);

    return response.render('projectsAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      teams: rows,
      formData: {
        name: '',
        description: '',
        team_id: defaultTeamId,
        status: 'active',
        start_date: '',
        end_date: '',
      },
      errors: '',
      error: '',
      msg: '',
    });
  } catch (error) {
    return next(error);
  }
};

exports.post_add = async (request, response, next) => {
  const {name, description, team_id, status, start_date, end_date} = request.body;
  const normalizedName = (name || '').trim();
  const normalizedDescription = (description || '').trim();
  const normalizedTeamId = (team_id || '').trim();
  const normalizedStatus = (status || 'active').trim();
  const normalizedStartDate = (start_date || '').trim();
  const normalizedEndDate = (end_date || '').trim();

  const formData = {
    name: normalizedName,
    description: normalizedDescription,
    team_id: normalizedTeamId,
    status: normalizedStatus,
    start_date: normalizedStartDate,
    end_date: normalizedEndDate,
  };

  const userId = await getCurrentUserId(request);

  if (!userId) {
    request.session.error = 'Session user not found. Please log in again.';
    return response.redirect('/login');
  }

  const renderForm = async (payload) => {
    const [teams] = await Project.getTeamsByUser(userId);
    response.status(payload.statusCode || 400).render('projectsAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      teams,
      formData,
      errors: payload.errors || '',
      error: payload.error || '',
      msg: payload.msg || '',
    });
  };

  try {
    if (!normalizedName || !normalizedDescription || !normalizedTeamId || !normalizedStartDate) {
      return await renderForm({
        errors: 'Missing required fields.',
      });
    }

    if (normalizedName.length > PROJECT_NAME_MAX_LENGTH) {
      return await renderForm({
        error: `Project name cannot exceed ${PROJECT_NAME_MAX_LENGTH} characters.`,
      });
    }

    if (normalizedDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      return await renderForm({
        error: `Project description cannot exceed ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`,
      });
    }

    const [allowedTeams] = await Project.getTeamsByUser(userId);
    const canUseTeam = allowedTeams.some(
        (team) => String(team.team_id) === String(normalizedTeamId),
    );

    if (!canUseTeam) {
      return await renderForm({
        error: 'Invalid team selection for your account.',
      });
    }

    const [existingRows] = await Project.findByNameAndTeam(
        normalizedName,
        normalizedTeamId,
    );
    if (existingRows.length > 0) {
      return await renderForm({
        error: 'A project with this name already exists for the selected team.',
      });
    }

    const resolvedEndDate = resolveEndDateForStatus(
        normalizedStatus,
        normalizedEndDate,
    );

    if (isEndDateBeforeStartDate(normalizedStartDate, resolvedEndDate)) {
      return await renderForm({
        error: 'End date cannot be before start date.',
      });
    }

    const createdAt = new Date();
    const insertedProject = await Project.insert({
      name: normalizedName,
      description: normalizedDescription,
      start_date: normalizedStartDate,
      end_date: resolvedEndDate,
      team_id: normalizedTeamId,
      status: normalizedStatus,
      created_at: createdAt,
    });

    request.session.success = 'Project created successfully.';
    return response.redirect('/projects/list');
  } catch (error) {
    console.error(
        '[POST /projects/add] Failed to save project:',
        error.sqlMessage || error.message,
    );
    try {
      if (isDataTooLongError(error)) {
        return await renderForm({
          error: `Project text is too long. Name max: ${PROJECT_NAME_MAX_LENGTH} characters, description max: ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`,
        });
      }

      return await renderForm({
        msg: 'Could not save the project.',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
};

exports.post_delete = (request, response, next) => {
  const projectId = request.params.id;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  Project.delete(projectId)
      .then(() => {
        console.log(`[POST /projects/delete] Project ${projectId} deleted successfully`);
        request.session.success = 'Project deleted successfully!';
        return response.redirect('/projects/list');
      })
      .catch((error) => {
        console.error('[POST /projects/delete] Failed to delete project:', error.sqlMessage || error.message);
        request.session.error = 'Error deleting project: ' + (error.sqlMessage || error.message || 'Unknown error');
        return response.redirect('/projects/list');
      });
};

exports.get_edit = (request, response, next) => {
  const projectId = request.params.id;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  Promise.all([
    getCurrentUserId(request),
  ])
      .then(async ([userId]) => {
        if (!userId) {
          request.session.error = 'Session user not found. Please log in again.';
          return response.redirect('/login');
        }

        const [[projectRows], [teamRows]] = await Promise.all([
          Project.fetchOneByUserTeams(projectId, userId),
          Project.getTeamsByUser(userId),
        ]);

        if (!projectRows || projectRows.length === 0) {
          request.session.error = 'Project not found or access denied.';
          return response.redirect('/projects/list');
        }

        const project = projectRows[0];

        return response.render('projectsEdit', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          teams: teamRows,
          project,
          formData: {
            name: project.name || '',
            description: project.description || '',
            team_id: project.team_id ? String(project.team_id) : '',
            status: project.status || 'active',
            start_date: formatDateForInput(project.start_date),
            end_date: formatDateForInput(project.end_date),
          },
          errors: '',
          error: request.session.error || '',
          msg: '',
        });
      })
      .catch((error) => {
        console.error('[GET /projects/edit] Failed to load edit form:', error.message);
        request.session.error = 'Error loading edit form.';
        return response.redirect('/projects/list');
      });
};

exports.post_edit = async (request, response, next) => {
  const projectId = request.params.id;
  const {name, description, team_id, status, start_date, end_date} = request.body;
  const normalizedName = (name || '').trim();
  const normalizedDescription = (description || '').trim();
  const normalizedTeamId = (team_id || '').trim();
  const normalizedStatus = (status || 'active').trim();
  const normalizedStartDate = (start_date || '').trim();
  const normalizedEndDate = (end_date || '').trim();

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  const userId = await getCurrentUserId(request);

  if (!userId) {
    request.session.error = 'Session user not found. Please log in again.';
    return response.redirect('/login');
  }

  const formData = {
    name: normalizedName,
    description: normalizedDescription,
    team_id: normalizedTeamId,
    status: normalizedStatus,
    start_date: normalizedStartDate,
    end_date: normalizedEndDate,
  };

  const renderForm = async (payload) => {
    const [[projectRows], [teams]] = await Promise.all([
      Project.fetchOneByUserTeams(projectId, userId),
      Project.getTeamsByUser(userId),
    ]);

    if (!projectRows || projectRows.length === 0) {
      request.session.error = 'Project not found or access denied.';
      return response.redirect('/projects/list');
    }

    return response.status(payload.statusCode || 400).render('projectsEdit', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      teams,
      project: projectRows[0],
      formData,
      errors: payload.errors || '',
      error: payload.error || '',
      msg: payload.msg || '',
    });
  };

  try {
    if (!normalizedName || !normalizedDescription || !normalizedTeamId || !normalizedStartDate) {
      return await renderForm({
        errors: 'Missing required fields.',
      });
    }

    if (normalizedName.length > PROJECT_NAME_MAX_LENGTH) {
      return await renderForm({
        error: `Project name cannot exceed ${PROJECT_NAME_MAX_LENGTH} characters.`,
      });
    }

    if (normalizedDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
      return await renderForm({
        error: `Project description cannot exceed ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`,
      });
    }

    const [[projectRows], [allowedTeams]] = await Promise.all([
      Project.fetchOneByUserTeams(projectId, userId),
      Project.getTeamsByUser(userId),
    ]);

    if (!projectRows || projectRows.length === 0) {
      request.session.error = 'Project not found or access denied.';
      return response.redirect('/projects/list');
    }

    const canUseTeam = allowedTeams.some(
        (team) => String(team.team_id) === String(normalizedTeamId),
    );

    if (!canUseTeam) {
      return await renderForm({
        error: 'Invalid team selection for your account.',
      });
    }

    const [existingRows] = await Project.findByNameAndTeamExcludingId(
        normalizedName,
        normalizedTeamId,
        projectId,
    );

    if (existingRows.length > 0) {
      return await renderForm({
        error: 'A project with this name already exists for the selected team.',
      });
    }

    const resolvedEndDate = resolveEndDateForStatus(
        normalizedStatus,
        normalizedEndDate,
    );

    if (isEndDateBeforeStartDate(normalizedStartDate, resolvedEndDate)) {
      return await renderForm({
        error: 'End date cannot be before start date.',
      });
    }

    await Project.update(projectId, {
      name: normalizedName,
      description: normalizedDescription,
      start_date: normalizedStartDate,
      end_date: resolvedEndDate,
      team_id: normalizedTeamId,
      status: normalizedStatus,
    });

    request.session.success = 'Project updated successfully.';
    return response.redirect('/projects/list');
  } catch (error) {
    console.error('[POST /projects/edit] Failed to update project:', error.sqlMessage || error.message);
    try {
      if (isDataTooLongError(error)) {
        return await renderForm({
          error: `Project text is too long. Name max: ${PROJECT_NAME_MAX_LENGTH} characters, description max: ${PROJECT_DESCRIPTION_MAX_LENGTH} characters.`,
        });
      }

      return await renderForm({
        msg: 'Could not update the project.',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
};

exports.get_link = async (request, response, next) => {
  const projectId = request.params.id;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      request.session.error = 'Session user not found. Please log in again.';
      return response.redirect('/login');
    }

    const [[projectRows], [teamRows]] = await Promise.all([
      Project.fetchOneByUserTeams(projectId, userId),
      Project.getTeamsByUser(userId),
    ]);

    if (!projectRows || projectRows.length === 0) {
      request.session.error = 'Project not found or access denied.';
      return response.redirect('/projects/list');
    }

    response.render('projectLink', {
      csrfToken: request.csrfToken(),
      error: request.session.error || '',
      email: request.session.email || '',
      project: projectRows[0],
      teams: teamRows,
    });
    request.session.error = '';
  } catch (error) {
    console.error('[GET /projects/link] Failed to load link form:', error.message);
    request.session.error = 'Error loading link form.';
    return response.redirect('/projects/list');
  }
};

exports.get_details = (request, response, next) => {
  const projectId = request.params.projectId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  console.log(`[GET /projects/details] Loading project ${projectId}`);

  Promise.all([
    Project.getProjectDetails(projectId),
    Project.selectLast3reports(projectId),
  ])
      .then(([projectResult, reportsResult]) => {
        console.log(`[GET /projects/details] Project query result structure:`, projectResult);
        console.log(`[GET /projects/details] Reports query result structure:`, reportsResult);

        let rows = [];
        if (Array.isArray(projectResult) && Array.isArray(projectResult[0]) && Array.isArray(projectResult[0][0])) {
          rows = projectResult[0][0];
        } else if (Array.isArray(projectResult) && Array.isArray(projectResult[0])) {
          rows = projectResult[0];
        }

        let reports = [];
        if (Array.isArray(reportsResult) && Array.isArray(reportsResult[0])) {
          reports = reportsResult[0];
        } else if (Array.isArray(reportsResult)) {
          reports = reportsResult;
        }

        console.log(`[GET /projects/details] Extracted rows:`, rows);
        console.log(`[GET /projects/details] Extracted reports:`, reports);

        if (!rows || rows.length === 0) {
          console.log(`[GET /projects/details] No data found for project ${projectId}`);
          request.session.error = 'Project not found.';
          return response.redirect('/projects/list');
        }

        const firstRow = rows[0];
        const projectName = (firstRow.name || firstRow.project_name || '').trim();
        const members = rows
            .filter((row) => row.user_id !== null && row.user_id !== undefined)
            .map((row) => ({
              user_id: parseInt(row.user_id),
              full_name: row.full_name,
              email: row.email,
              slack_handle: row.slack_handle,
            }));

        console.log(`[GET /projects/details] First row object:`, firstRow);
        console.log(`[GET /projects/details] Project Name extracted: "${projectName}"`);
        console.log(`[GET /projects/details] Reports count: ${reports.length}`);

        const viewData = {
          csrfToken: request.csrfToken(),
          error: error,
          email: request.session.email || '',
          projectId: projectId,
          projectName: projectName,
          project: {
            project_id: firstRow.project_id || projectId,
            name: projectName,
            description: firstRow.description || '',
            status: firstRow.status || '',
            start_date: firstRow.start_date || null,
            end_date: firstRow.end_date || null,
            team_name: firstRow.team_name || '',
          },
          members: members,
          reports: reports,
          latestReport: reports && reports.length > 0 ? reports[0] : null,
        };

        response.render('projectDetails', viewData);
      })
      .catch((error) => {
        console.error('[GET /projects/details] Failed to fetch project details:', error);
        console.error('[GET /projects/details] Error message:', error.message);
        console.error('[GET /projects/details] Error code:', error.code);
        request.session.error = 'Error loading project details: ' + (error.message || 'Unknown error');
        return response.redirect('/projects/list');
      });
};

exports.getReport = (request, response, next) => {
  const projectId = request.params.projectId;
  const reportId = Number(request.query.reportId) || 0;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  return getCurrentUserId(request)
      .then(async (userId) => {
        if (!userId) {
          request.session.error = 'Session user not found. Please log in again.';
          return response.redirect('/login');
        }

        const [[projectRows]] = await Promise.all([
          Project.fetchOneByUserTeams(projectId, userId),
        ]);

        if (!projectRows || projectRows.length === 0) {
          request.session.error = 'Project not found or access denied.';
          return response.redirect('/projects/list');
        }

        const project = {
          project_id: projectRows[0].project_id,
          name: projectRows[0].name,
          start_date: projectRows[0].start_date,
          end_date: projectRows[0].end_date,
        };

        console.log('[GET /projects/report] Project data retrieved:');
        console.log('  - project_id:', project.project_id);
        console.log('  - name:', project.name);
        console.log('  - start_date (raw):', project.start_date);
        console.log('  - start_date (type):', typeof project.start_date);
        console.log('  - end_date (raw):', project.end_date);
        console.log('  - end_date (type):', typeof project.end_date);

        if (!reportId) {
          console.log('[GET /projects/report] No reportId, showing form');
          console.log('  - startDate formatted:', formatDateForInput(project.start_date));
          console.log('  - endDate formatted:', formatDateForInput(project.end_date));
          
          const startStr = formatDateForInput(project.start_date);
          const endStr = formatDateForInput(project.end_date);
          
          return response.render('projectReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            role: request.session.role || '',
            project,
            report: null,
            error: null,
            startDate: startStr,
            endDate: endStr,
          });
        }

        return Reports.findProjectReportById(reportId, projectId)
            .then(([reportRows]) => {
              console.log('[GET /projects/report] Query result for reportId:', reportId);
              console.log('[GET /projects/report] Query result for projectId:', projectId);
              console.log('[GET /projects/report] Found rows:', reportRows ? reportRows.length : 0);
              if (reportRows && reportRows.length > 0) {
                console.log('[GET /projects/report] First report:', reportRows[0]);
              }
              if (!reportRows || reportRows.length === 0) {
                console.log('[GET /projects/report] ERROR - No report found. Checking database...');
                return response.render('projectReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  role: request.session.role || '',
                  project,
                  report: null,
                  error: 'Saved report not found for this project. (reportId: ' + reportId + ', projectId: ' + projectId + ')',
                  startDate: formatDateForInput(project.start_date),
                  endDate: formatDateForInput(project.end_date),
                });
              }

              const saved = reportRows[0];
              return response.render('projectReport', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                role: request.session.role || '',
                project,
                report: saved.ai_content,
                error: null,
                startDate: formatDateForInput(saved.date_beginning),
                endDate: formatDateForInput(saved.date_end),
                reportId: reportId,
              });
            });
      })
      .catch((error) => {
        console.error('[GET /projects/report] Error:');
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
        console.error('  - Full error object:', error);
        next(error);
      });
};

exports.postReport = (request, response, next) => {
  const projectId = request.params.projectId;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  return getCurrentUserId(request)
      .then(async (userId) => {
        if (!userId) {
          request.session.error = 'Session user not found. Please log in again.';
          return response.redirect('/login');
        }

        const [[projectRows]] = await Promise.all([
          Project.fetchOneByUserTeams(projectId, userId),
        ]);

        if (!projectRows || projectRows.length === 0) {
          request.session.error = 'Project not found or access denied.';
          return response.redirect('/projects/list');
        }

        const project = {
          project_id: projectRows[0].project_id,
          name: projectRows[0].name,
          start_date: projectRows[0].start_date,
          end_date: projectRows[0].end_date,
        };

        // Log detailed information about the project for debugging
        console.log('[POST /projects/report] Project data retrieved:');
        console.log('  - project_id:', project.project_id);
        console.log('  - name:', project.name);
        console.log('  - start_date (raw):', project.start_date);
        console.log('  - start_date (type):', typeof project.start_date);
        console.log('  - end_date (raw):', project.end_date);
        console.log('  - end_date (type):', typeof project.end_date);

        const renderError = (msg) => {
          return response.status(400).render('projectReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            role: request.session.role || '',
            project,
            report: null,
            error: msg,
            startDate: formatDateForInput(project.start_date),
            endDate: formatDateForInput(project.end_date),
          });
        };

        // Validate that project has a start_date
        if (!project.start_date) {
          console.error('[POST /projects/report] Error: Project has no start_date');
          return renderError(
              'Project does not have a start date. ' +
              'Please set a start date for the project before generating a report.',
          );
        }

        // Use project start_date and end_date
        // Handle both string and Date object formats from the database
        let startDate;
        if (project.start_date instanceof Date) {
          console.log('[POST /projects/report] start_date is a Date object, using directly');
          startDate = new Date(project.start_date);
          startDate.setHours(0, 0, 0, 0);
        } else if (typeof project.start_date === 'string') {
          console.log('[POST /projects/report] start_date is a string, parsing');
          startDate = new Date(project.start_date + 'T00:00:00');
        } else {
          console.error('[POST /projects/report] start_date is unexpected type:', typeof project.start_date);
          startDate = new Date(project.start_date);
        }
        
        console.log('[POST /projects/report] Final startDate:', startDate);
        console.log('[POST /projects/report] startDate.getTime():', startDate.getTime());
        console.log('[POST /projects/report] isNaN(startDate.getTime()):', isNaN(startDate.getTime()));
        
        if (isNaN(startDate.getTime())) {
          console.error('[POST /projects/report] Error: Invalid startDate after parsing');
          console.error('  - Input was:', project.start_date);
          console.error('  - Input type was:', typeof project.start_date);
          console.error('  - Parsed Date object:', startDate);
          return renderError('Invalid project start date.');
        }

        // Use project end_date if available, otherwise use today
        let endDate;
        if (project.end_date) {
          if (project.end_date instanceof Date) {
            console.log('[POST /projects/report] end_date is a Date object, using directly');
            endDate = new Date(project.end_date);
            endDate.setHours(0, 0, 0, 0);
          } else if (typeof project.end_date === 'string') {
            console.log('[POST /projects/report] end_date is a string, parsing');
            endDate = new Date(project.end_date + 'T00:00:00');
          } else {
            console.error('[POST /projects/report] end_date is unexpected type:', typeof project.end_date);
            endDate = new Date(project.end_date);
          }
          console.log('[POST /projects/report] Parsed endDate:', endDate);
          console.log('[POST /projects/report] isNaN(endDate.getTime()):', isNaN(endDate.getTime()));
          if (isNaN(endDate.getTime())) {
            console.error('[POST /projects/report] Error: Invalid endDate after parsing');
            return renderError('Invalid project end date.');
          }
        } else {
          console.log('[POST /projects/report] No end_date set, using today');
          endDate = new Date();
          endDate.setHours(0, 0, 0, 0);
          console.log('[POST /projects/report] Set endDate to today:', endDate);
        }

        console.log('[POST /projects/report] Final dates for standup query:');
        console.log('  - startDate:', startDate.toISOString());
        console.log('  - endDate:', endDate.toISOString());

        if (startDate > endDate) {
          console.error('[POST /projects/report] Error: startDate is after endDate');
          return renderError('Project start date cannot be after end date.');
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        console.log('[POST /projects/report] Querying standups with:');
        console.log('  - startStr:', startStr);
        console.log('  - endStr:', endStr);
        console.log('  - projectId:', projectId);

        return Project.getStandupsByDateRange(startStr, endStr)
            .then(([standups]) => {
              console.log('[POST /projects/report] Standups query result:');
              console.log('  - Found standups:', standups ? standups.length : 0);
              if (!standups || standups.length === 0) {
                console.log('[POST /projects/report] Error: No standups found');
                return renderError(
                    'No daily standups found for the project\'s date range ' +
                    'between ' + startStr + ' and ' + endStr +
                    '. A report cannot be generated without standup data.',
                );
              }

              return Reports.findProjectReportByRange(
                  projectId, startStr, endStr,
              )
                  .then(async (existing) => {
                    console.log('[POST /projects/report] Checking for existing reports:');
                    console.log('  - Found existing reports:', existing && existing[0] ? existing[0].length : 0);
                    
                    if (existing && existing[0] && existing[0].length > 0) {
                      console.log('[POST /projects/report] Report already exists for this date range');
                      console.log('[POST /projects/report] Redirecting to existing report:', existing[0][0].report_id);
                      return response.redirect(
                          '/projects/report/' + projectId +
                          '?reportId=' + existing[0][0].report_id,
                      );
                    }

                    console.log('[POST /projects/report] >>> Creating NEW report - DELETED_AT will NOT be set');
                    console.log('[POST /projects/report] Generating new AI report');
                    return generateProjectReport(
                        project,
                        startDate,
                        endDate,
                        standups,
                    )
                        .then((reportText) => {
                          console.log('[POST /projects/report] AI report generated, saving to database');
                          const standupIds = standups.map(
                              (r) => r.standup_id,
                          );
                          return Reports.createProjectReport({
                            generatedByUserId: userId,
                            projectId,
                            startDate: startStr,
                            endDate: endStr,
                            aiContent: reportText,
                            standupIds,
                          });
                        })
                        .then((created) => {
                          console.log('[POST /projects/report] Report saved successfully:', created.report_id);
                          return response.redirect(
                              '/projects/report/' + projectId +
                              '?reportId=' + created.report_id,
                          );
                        });
                  });
            })
            .catch((aiError) => {
              console.error('[POST /projects/report] Error during report generation:');
              console.error('  - Error message:', aiError.message);
              console.error('  - Error stack:', aiError.stack);
              console.error('  - Full error object:', aiError);
              return response.render('projectReport', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                role: request.session.role || '',
                project,
                report: null,
                error: 'Failed to generate AI report: ' +
                (aiError.message || 'Unknown error'),
                startDate: formatDateForInput(project.start_date),
                endDate: formatDateForInput(project.end_date),
              });
            });
      })
      .catch((error) => {
        console.error('[POST /projects/report] Outer error:');
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
        console.error('  - Full error object:', error);
        next(error);
      });
};

exports.post_link = async (request, response, next) => {
  const projectId = request.params.id;
  const teamId = (request.body.team_id || '').trim();

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  if (!teamId) {
    request.session.error = 'Please select a team.';
    return response.redirect(`/projects/link/${projectId}`);
  }

  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      request.session.error = 'Session user not found. Please log in again.';
      return response.redirect('/login');
    }

    const [[projectRows], [allowedTeams]] = await Promise.all([
      Project.fetchOneByUserTeams(projectId, userId),
      Project.getTeamsByUser(userId),
    ]);

    if (!projectRows || projectRows.length === 0) {
      request.session.error = 'Project not found or access denied.';
      return response.redirect('/projects/list');
    }

    const canUseTeam = allowedTeams.some(
        (team) => String(team.team_id) === String(teamId),
    );

    if (!canUseTeam) {
      request.session.error = 'Invalid team selection for your account.';
      return response.redirect(`/projects/link/${projectId}`);
    }

    await Project.updateTeam(projectId, teamId);
    console.log(`[POST /projects/link] Project ${projectId} linked to team ${teamId}`);
    request.session.success = 'Project linked to team successfully!';
    return response.redirect('/projects/list');
  } catch (error) {
    console.error('[POST /projects/link] Failed to link project:', error.sqlMessage || error.message);
    request.session.error = 'Error linking project to team: ' + (error.sqlMessage || error.message || 'Unknown error');
    return response.redirect(`/projects/link/${projectId}`);
  }
};
