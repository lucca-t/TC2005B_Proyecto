const Project = require('../models/projects.model');

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
    const [teams] = await Project.getTeams();
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

    const [existingRows] = await Project.findByNameAndTeam(normalizedName, normalizedTeamId);
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
    console.error('[POST /projects/add] Failed to save project:', error.sqlMessage || error.message);
    try {
      return await renderForm({
        msg: 'Could not save the project.',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
};
