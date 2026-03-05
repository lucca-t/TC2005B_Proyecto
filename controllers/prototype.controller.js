const Prototype = require('../models/prototype.model');

exports.get_prototype = ((request, response, next) => {
    response.render('landing_page', {
        username: request.session.username || '',
    });
});

exports.get_user_report = ((request, response, next) => {
    response.render('userReport', {
        username: request.session.username || '',
    });
});

exports.get_team_report = ((request, response, next) => {
    response.render('teamReport', {
        username: request.session.username || '',
    });
});

exports.get_project_report = ((request, response, next) => {
    response.render('projectReport', {
        username: request.session.username || '',
    });
});