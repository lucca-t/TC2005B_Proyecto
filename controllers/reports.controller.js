const Reports = require('../models/reports.model');

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

exports.get_reports = ((request, response, next) => {
    response.render('reports', {
        username: request.session.username || '',
    });
});