const Project = require('../models/projects.model');
const User = require('../models/users.model');

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

    return response.render('projectShow', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      project: insertedProject,
      success: 'Project created successfully.',
    });
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
        next(error);
      });
};
