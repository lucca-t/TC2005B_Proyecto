const Reports = require('../models/reports.model');

exports.get_user_report = ((request, response, next) => {
  response.render('userReport', {
    email: request.session.email || '',
  });
});

exports.get_team_report = ((request, response, next) => {
  response.render('teamReport', {
    email: request.session.email || '',
  });
});

exports.get_project_report = ((request, response, next) => {
  response.render('projectReport', {
    email: request.session.email || '',
  });
});

exports.get_reports = ((request, response, next) => {
  response.render('reports', {
    email: request.session.email || '',
  });
});
