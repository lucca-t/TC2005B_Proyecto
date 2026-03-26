const User = require('../models/users.model');
const bcrypt = require('bcrypt');

exports.get_login = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('login', {
        csrfToken: request.csrfToken(),
        error: error,
        title: "Login - Daily Standup+", 
        email: request.session.email || '',
    });
};

exports.post_login = (request, response, next) => {
    request.session.email = request.body.email || request.body.username;
    request.session.password = request.body.password; 
    response.redirect('/homepage');
};

exports.get_logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/login'); 
    });
};
