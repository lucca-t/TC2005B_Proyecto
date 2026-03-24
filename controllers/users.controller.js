const User = require('../models/users.model');
const bcrypt = require('bcrypt');

exports.get_login = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('login', {
        csrfToken: request.csrfToken(),
        error: error,
        title: "Login - Daily Standup+", 
        username: request.session.username || '',
    });
};

exports.post_login = (request, response, next) => {
    request.session.username = request.body.username;
    request.session.password = request.body.password; 
    response.redirect('/users/home');
};

exports.logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/users/login'); 
    });
};

exports.get_home = (request, response, next) => {
    request.session.username = request.body.username;
    response.render('home', {
        
    })
}