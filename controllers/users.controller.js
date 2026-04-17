const User = require('../models/users.model');
const {generateUserReport} = require('../util/ai-report');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.get_list = (request, response, next) => {
  User.getAll().then(([rows, fieldData]) => {
    response.render('userList', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      users: rows,
    });
  })
      .catch((error) => {
        next(error);
      });
};

exports.get_add = (request, response, next) => {
  response.render('userAdd', {
    csrfToken: request.csrfToken(),
    email: request.session.email || '',
  });
};

exports.get_edit = (request, response, next) => {
  User.fetchOne(request.params.email)
      .then(([rows, fieldData]) => {
        response.render('userEdit', {
          user: rows[0],
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
        });
      })
      .catch((error) => {
        next(error);
      });
};

exports.post_add = (request, response, next) => {
  const {
    email,
    password,
    full_name,
    slack_handle,
    slack_id,
  } = request.body;

  if (!EMAIL_REGEX.test((email || '').trim())) {
    return response.status(400).render('userAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'Email format is invalid. Please use a valid email address.',
    });
  }

  const user = new User(
      email,
      password,
      full_name,
      slack_handle,
      slack_id,
  );

  user.save()
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error('[POST /users/add] Failed to save user:', error.sqlMessage || error.message);
        response.status(400).render('userAdd', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          error: 'Error creating user: ' + (error.sqlMessage || error.message || 'Unknown error'),
        });
      });
};

exports.post_edit = (request, response, next) => {
  const originalEmail = request.params.email;
  const {
    email,
    full_name,
    slack_handle,
    slack_id,
  } = request.body;

  const normalizedEmail = (email || '').trim();
  const normalizedFullName = (full_name || '').trim();
  const normalizedSlackHandle = (slack_handle || '').trim();
  const normalizedSlackId = (slack_id || '').trim();

  if (!normalizedEmail || !normalizedFullName || !normalizedSlackHandle || !normalizedSlackId) {
    return response.status(400).render('userEdit', {
      user: {
        email: normalizedEmail,
        full_name: normalizedFullName,
        slack_handle: normalizedSlackHandle,
        slack_id: normalizedSlackId,
      },
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'All fields are required. None can be empty.',
    });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return response.status(400).render('userEdit', {
      user: {
        email: normalizedEmail,
        full_name: normalizedFullName,
        slack_handle: normalizedSlackHandle,
        slack_id: normalizedSlackId,
      },
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'Email format is invalid. Please use a valid email address.',
    });
  }

  const updatePromise = User.updateWithoutPassword(
      originalEmail,
      normalizedEmail,
      normalizedFullName,
      normalizedSlackHandle,
      normalizedSlackId,
  );

  updatePromise
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error('[POST /users/edit] Failed to update user:', error.sqlMessage || error.message);
        response.status(400).render('userEdit', {
          user: {
            email: normalizedEmail,
            full_name: normalizedFullName,
            slack_handle: normalizedSlackHandle,
            slack_id: normalizedSlackId,
          },
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          error: 'Error updating user: ' + (error.sqlMessage || error.message || 'Unknown error'),
        });
      });
};

exports.post_delete = (request, response, next) => {
  const userId = request.params.userId;

  User.softDelete(userId)
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error('[POST /users/delete] Failed to delete user:', error.sqlMessage || error.message);
        next(error);
      });
};

exports.get_role = (request, response, next) => {
  const userId = request.params.userId;

  Promise.all([
    User.getUserRole(userId),
    User.getAllRoles(),
    User.getAll(),
  ])
      .then(([[roleRows], [roles], [allUsers]]) => {
        const currentRole = roleRows.length > 0 ? roleRows[0] : null;
        const user = allUsers.find((u) => String(u.user_id) === String(userId)) || {user_id: userId, email: '', full_name: ''};

        response.render('userRole', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          user: user,
          currentRole: currentRole,
          roles: roles,
        });
      })
      .catch((error) => {
        console.error('[GET /users/role] Failed to load role page:', error.message);
        next(error);
      });
};

exports.post_role = (request, response, next) => {
  const userId = request.params.userId;
  const {role_id} = request.body;

  if (!role_id) {
    return response.redirect(`/users/role/${userId}`);
  }

  User.assignRole(userId, role_id)
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error('[POST /users/role] Failed to assign role:', error.message);
        next(error);
      });
};

exports.get_report = (request, response, next) => {
  const userId = request.params.userId;

  User.fetchById(userId)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/users/list');
        }
        const user = rows[0];
        return generateUserReport(user).then((reportText) => {
          response.render('userReport', {
            email: request.session.email || '',
            user: user,
            report: reportText,
          });
        });
      })
      .catch((error) => {
        console.error('[GET /users/report] Failed to generate report:', error.message);
        next(error);
      });
}