const User = require('../models/users.model');

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
        slack_id
    } = request.body;

    if (!EMAIL_REGEX.test((email || '').trim())) {
        return response.status(400).render('userAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Email format is invalid. Please use a valid email address.'
        });
    }

    const user = new User(
        email,
        password,
        full_name,
        slack_handle,
        slack_id
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
                error: 'Error creating user: ' + (error.sqlMessage || error.message || 'Unknown error')
            });
        });
};

exports.post_edit = (request, response, next) => {
    const originalEmail = request.params.email;
    const {
        email,
        full_name,
        slack_handle,
        slack_id
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
                slack_id: normalizedSlackId
            },
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'All fields are required. None can be empty.'
        });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
        return response.status(400).render('userEdit', {
            user: {
                email: normalizedEmail,
                full_name: normalizedFullName,
                slack_handle: normalizedSlackHandle,
                slack_id: normalizedSlackId
            },
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Email format is invalid. Please use a valid email address.'
        });
    }

    const updatePromise = User.updateWithoutPassword(
        originalEmail,
        normalizedEmail,
        normalizedFullName,
        normalizedSlackHandle,
        normalizedSlackId
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
                    slack_id: normalizedSlackId
                },
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                error: 'Error updating user: ' + (error.sqlMessage || error.message || 'Unknown error')
            });
        });
};