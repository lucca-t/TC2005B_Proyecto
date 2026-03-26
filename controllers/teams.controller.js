const User = require('../models/teams.model');
const bcrypt = require('bcrypt');

exports.get_list = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('teamList', {
        csrfToken: request.csrfToken(),
        error: error, 
        email: request.session.email || '',
    });
};

//Modify to allow get edit of a specific team
exports.get_edit = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('teamEdit', {
        csrfToken: request.csrfToken(),
        error: error,
        email: request.session.email || '',
    });
};

exports.get_add = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('teamAdd', {
        csrfToken: request.csrfToken(),
        error: error,
        email: request.session.email || '',
    });
};