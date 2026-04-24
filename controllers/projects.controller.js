/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const Project = require('../models/projects.model');
const User = require('../models/users.model');

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
