const User = require('../models/users.model');

exports.get_list = (request, response, next) => {
    User.getAll().then(([rows, fieldData]) => {
        response.render('userList', {
            csrfToken: request.csrfToken(),
            username: request.session.username || '',
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
        username: request.session.username || '',
    });
};

//Modify to allow get edit of a specific team
exports.get_edit = (request, response, next) => {
    User.fetchOne(request.params.username)
    .then(([rows, fieldData]) => {

        response.render('userEdit', {
            user: rows[0],
            csrfToken: request.csrfToken(),
            username: request.session.username || '',
        });

    })
    .catch((error) => {
        next(error);
    });
};

exports.post_add = (request, response, next) => {
    const {
        username,
        password,
        full_name,
        slack_handle,
        slack_id
    } = request.body;

    const user = new User(
        username,
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
                username: request.session.username || '',
                error: 'Error creating user: ' + (error.sqlMessage || error.message || 'Unknown error')
            });
        });
};