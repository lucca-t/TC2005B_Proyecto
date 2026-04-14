/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const Project = require('../models/projects.model');
const User = require('../models/users.model');

const formatDateForInput = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
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
  const {name, description, team_id, status, start_date} = request.body;
  const normalizedName = (name || '').trim();
  const normalizedDescription = (description || '').trim();
  const normalizedTeamId = (team_id || '').trim();
  const normalizedStatus = (status || 'active').trim();
  const normalizedStartDate = (start_date || '').trim();

  const formData = {
    name: normalizedName,
    description: normalizedDescription,
    team_id: normalizedTeamId,
    status: normalizedStatus,
    start_date: normalizedStartDate,
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

    const createdAt = new Date();
    const insertedProject = await Project.insert({
      name: normalizedName,
      description: normalizedDescription,
      start_date: normalizedStartDate,
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
  const {name, description, team_id, status, start_date} = request.body;
  const normalizedName = (name || '').trim();
  const normalizedDescription = (description || '').trim();
  const normalizedTeamId = (team_id || '').trim();
  const normalizedStatus = (status || 'active').trim();
  const normalizedStartDate = (start_date || '').trim();

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

    await Project.update(projectId, {
      name: normalizedName,
      description: normalizedDescription,
      start_date: normalizedStartDate,
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
