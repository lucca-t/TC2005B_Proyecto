/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const Project = require('../models/projects.model');
const User = require('../models/users.model');
const Reports = require('../models/reports.model');
const {generateProjectReport} = require('../util/ai-report');

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

    return response.render('projectsAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      teams: rows,
      formData: {
        name: '',
        description: '',
        team_id: '',
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
    Project.getProjectBlockersCount(projectId),
  ])
      .then(([projectResult, reportsResult, blockersResult]) => {
        console.log(`[GET /projects/details] Project query result structure:`, projectResult);
        console.log(`[GET /projects/details] Reports query result structure:`, reportsResult);
        console.log(`[GET /projects/details] Blockers query result structure:`, blockersResult);

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

        let blockers = { blocker_count: 0, users_with_blockers: 0 };
        if (Array.isArray(blockersResult) && Array.isArray(blockersResult[0]) && blockersResult[0].length > 0) {
          blockers = blockersResult[0][0] || blockers;
        } else if (Array.isArray(blockersResult) && blockersResult.length > 0) {
          blockers = blockersResult[0] || blockers;
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
          blockers: blockers,
          members: members,
          reports: reports,
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

exports.getReport = (request, response, next) => {
  const projectId = request.params.projectId;
  const reportId = Number(request.query.reportId) || 0;

  Project.fetchOneByUserTeams(projectId, request.session.userId || 0)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/projects/list');
        }

        const project = rows[0];

        if (!reportId) {
          return response.render('projectReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            role: request.session.role || '',
            project,
            report: null,
            error: null,
            startDate: '',
            endDate: '',
            reportType: '',
          });
        }

        return Reports.findProjectReportById(reportId, projectId)
            .then(([reportRows]) => {
              if (!reportRows || reportRows.length === 0) {
                return response.render('projectReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  role: request.session.role || '',
                  project,
                  report: null,
                  error: 'Saved report not found for this project.',
                  startDate: '',
                  endDate: '',
                  reportType: '',
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
                reportType: '',
              });
            });
      })
      .catch((error) => {
        console.error(
            '[GET /projects/report] Failed to fetch project:',
            error.message,
        );
        next(error);
      });
};

exports.postReport = (request, response, next) => {
  const projectId = request.params.projectId;
  const {report_type, start_date, end_date} = request.body;

  Project.fetchOneByUserTeams(projectId, request.session.userId || 0)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/projects/list');
        }

        const project = rows[0];

        const renderError = (msg) => {
          return response.status(400).render('projectReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            role: request.session.role || '',
            project,
            report: null,
            error: msg,
            startDate: start_date || '',
            endDate: end_date || '',
            reportType: report_type || '',
          });
        };

        if (!report_type) {
          return renderError(
              'Please select at least one quarter or use the ' +
              'custom date range.',
          );
        }

        let startDate;
        let endDate;

        if (report_type === 'custom') {
          if (!start_date || !end_date) {
            return renderError(
                'Both start date and end date are required ' +
                'for a custom report.',
            );
          }
          startDate = new Date(start_date + 'T00:00:00');
          endDate = new Date(end_date + 'T00:00:00');

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return renderError(
                'Invalid date format. Please use valid dates.',
            );
          }
          if (startDate > endDate) {
            return renderError('Start date cannot be after end date.');
          }
        } else {
          const quarters = report_type
              .split(',')
              .map((q) => q.trim())
              .filter(Boolean);
          if (quarters.length === 0) {
            return renderError('Please select at least one quarter.');
          }

          const parsed = [];
          for (const q of quarters) {
            const match = q.match(/^(\d{4})-Q([1-4])$/);
            if (!match) {
              return renderError('Invalid quarter format: ' + q);
            }
            parsed.push({
              year: parseInt(match[1]),
              quarter: parseInt(match[2]),
            });
          }

          let minStart = null;
          let maxEnd = null;
          for (const p of parsed) {
            const qStart = new Date(p.year, (p.quarter - 1) * 3, 1);
            const qEnd = new Date(p.year, p.quarter * 3, 0);
            if (!minStart || qStart < minStart) minStart = qStart;
            if (!maxEnd || qEnd > maxEnd) maxEnd = qEnd;
          }
          startDate = minStart;
          endDate = maxEnd;
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        return Project.getProjectStandupsByDateRange(projectId, startStr, endStr)
            .then(([standups]) => {
              if (!standups || standups.length === 0) {
                return renderError(
                    'No daily standups found for ' +
                    project.name +
                    ' between ' + startStr + ' and ' + endStr +
                    '. A report cannot be generated without standup data.',
                );
              }

              return Reports.findProjectReportByRange(
                  projectId, startStr, endStr,
              )
                  .then(([existing]) => {
                    if (existing && existing.length > 0) {
                      return response.redirect(
                          '/projects/report/' + projectId +
                          '?reportId=' + existing[0].report_id,
                      );
                    }

                    return generateProjectReport(
                        project,
                        startDate,
                        endDate,
                        standups,
                    )
                        .then((reportText) => {
                          const standupIds = standups.map(
                              (r) => r.standup_id,
                          );
                          return getCurrentUserId(request)
                              .then((sessionUserId) => {
                                return Reports.createProjectReport({
                                  generatedByUserId: sessionUserId,
                                  projectId,
                                  startDate: startStr,
                                  endDate: endStr,
                                  aiContent: reportText,
                                  standupIds,
                                });
                              })
                              .then((created) => {
                                return response.redirect(
                                    '/projects/report/' + projectId +
                                    '?reportId=' + created.report_id,
                                );
                              });
                        });
                  });
            })
            .catch((aiError) => {
              console.error(
                  '[POST /projects/report] AI generation failed:',
                  aiError.message,
              );
              return response.render('projectReport', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                role: request.session.role || '',
                project,
                report: null,
                error: 'Failed to generate report: ' + (aiError.message || 'Unknown error'),
                startDate: startStr,
                endDate: endStr,
                reportType: report_type || '',
              });
            });
      })
      .catch((error) => {
        console.error(
            '[POST /projects/report] Failed to fetch project:',
            error.message,
        );
        next(error);
      });
};
