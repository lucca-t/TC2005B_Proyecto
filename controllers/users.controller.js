const User = require('../models/teams.model');
const bcrypt = require('bcrypt');


exports.get_list = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('userList', {
        csrfToken: request.csrfToken(),
        error: error, 
        username: request.session.username || '',
    });
};

//Modify to allow get edit of a specific team
exports.get_edit = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('userEdit', {
        csrfToken: request.csrfToken(),
        error: error,
        username: request.session.username || '',
    });
};

exports.get_add = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('userAdd', {
        csrfToken: request.csrfToken(),
        error: error,
        username: request.session.username || '',
    });
};