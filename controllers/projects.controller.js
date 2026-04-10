const Project = require('../models/projects.model');
const User = require('../models/users.model');

<<<<<<< HEAD
const getCurrentUserId = async (request) => {
  const email = request.session.email || '';
  if (!email) {
    return null;
  }

  const [rows] = await User.fetchOne(email);
  if (rows.length === 0) {
    return null;
  }

  return rows[0].user_id;
};

exports.get_add = async (request, response, next) => {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return next(new Error('User not found.'));
    }

    const [rows] = await Project.getTeams(userId);
    response.render('projectsAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      teams: rows,
      formData: {
        name: '',
        description: '',
        team_id: '',
        status: 'active',
      },
      errors: '',
      error: '',
      msg: '',
    });
  } catch (error) {
    next(error);
  }
=======
exports.get_list = (request, response, next) => {
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  Project.getAll()
      .then(([rows, fieldData]) => {
        response.render('projectShow', {
          csrfToken: request.csrfToken(),
          error: error,
          success: success,
          email: request.session.email || '',
          projects: rows,
        });
      })
      .catch((error) => {
        console.error('[GET /projects/list] Failed to fetch projects:', error.message);
        response.render('projectShow', {
          csrfToken: request.csrfToken(),
          error: 'Error loading projects.',
          success: '',
          email: request.session.email || '',
          projects: [],
        });
      });
};

exports.get_add = (request, response, next) => {
  Project.getTeams()
      .then(([rows, fieldData]) => {
        response.render('projectsAdd', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          teams: rows,
          formData: {
            name: '',
            description: '',
            team_id: '',
            status: 'active',
          },
          errors: '',
          error: '',
          msg: '',
        });
      })
      .catch((error) => {
        next(error);
      });
>>>>>>> cesar/ind
};

exports.post_add = async (request, response, next) => {
  const {name, description, team_id, status} = request.body;
  const normalizedName = (name || '').trim();
  const normalizedDescription = (description || '').trim();
  const normalizedTeamId = (team_id || '').trim();
  const normalizedStatus = (status || 'active').trim();

  const formData = {
    name: normalizedName,
    description: normalizedDescription,
    team_id: normalizedTeamId,
    status: normalizedStatus,
  };

  const renderForm = async (payload) => {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      throw new Error('User not found.');
    }

    const [teams] = await Project.getTeams(userId);
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
    if (!normalizedName || !normalizedDescription || !normalizedTeamId) {
      return await renderForm({
        errors: 'Missing required fields.',
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

<<<<<<< HEAD
exports.get_list = (request, response, next) => {
  getCurrentUserId(request)
      .then((userId) => {
        if (!userId) {
          throw new Error('User not found.');
        }

        return Project.getProjects(userId);
      })
      .then(([rows]) => {
        const projects = rows.map((row) => ({
          id: row.project_id,
          name: row.name,
          description: row.description,
          status: row.status,
          createdAt: row.created_at,
          projectState: row.project_state,
          endDate: row.end_date,
        }));

        response.render('projectsList', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          projects,
          emptyState: projects.length === 0 ?
              'There are no active projects at this time.' : '',
        });
      })
      .catch((error) => {
        console.error(
            '[GET /projects/list] Failed to load active projects:',
            error.message,
        );
        response.status(500).render('projectsList', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          projects: [],
          emptyState: 'Please try again later.',
          msg: 'Could not load active projects.',
        });
=======
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
  // TODO: Implement edit project
  const projectId = request.params.id;
  request.session.error = 'Edit project is not yet implemented.';
  return response.redirect('/projects/list');
};

exports.post_edit = (request, response, next) => {
  // TODO: Implement edit project
  const projectId = request.params.id;
  request.session.error = 'Edit project is not yet implemented.';
  return response.redirect('/projects/list');
};

exports.get_link = (request, response, next) => {
  const projectId = request.params.id;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  Promise.all([Project.fetchOne(projectId), Project.getTeams()])
      .then(([[projectRows], [teamRows]]) => {
        if (!projectRows || projectRows.length === 0) {
          request.session.error = 'Project not found.';
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
      })
      .catch((error) => {
        console.error('[GET /projects/link] Failed to load link form:', error.message);
        request.session.error = 'Error loading link form.';
        return response.redirect('/projects/list');
      });
};

exports.post_link = (request, response, next) => {
  const projectId = request.params.id;
  const {team_id} = request.body;

  if (!projectId) {
    request.session.error = 'Project ID is required.';
    return response.redirect('/projects/list');
  }

  if (!team_id) {
    request.session.error = 'Please select a team.';
    return response.redirect(`/projects/link/${projectId}`);
  }

  Project.updateTeam(projectId, team_id)
      .then(() => {
        console.log(`[POST /projects/link] Project ${projectId} linked to team ${team_id}`);
        request.session.success = 'Project linked to team successfully!';
        return response.redirect('/projects/list');
      })
      .catch((error) => {
        console.error('[POST /projects/link] Failed to link project:', error.sqlMessage || error.message);
        request.session.error = 'Error linking project to team: ' + (error.sqlMessage || error.message || 'Unknown error');
        return response.redirect(`/projects/link/${projectId}`);
>>>>>>> cesar/ind
      });
};
