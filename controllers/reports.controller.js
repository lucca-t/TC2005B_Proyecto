const Reports = require('../models/reports.model');
const {generateTeamReport} = require('../util/ai-report');
const Project = require('../models/projects.model');
const User = require('../models/users.model');
const db = require('../util/database');

exports.get_user_report = ((request, response, next) => {
  response.render('userReport', {
    email: request.session.email || '',
  });
});

exports.get_team_report = async (request, response, next) => {
  const { teamId, startDate, endDate } = request.query;
  let report = null;
  let teams = [];

  try {
    const [userRows] = await User.fetchOne(request.session.email);
    const user = userRows[0];
    const [teamsRows] = await Project.getTeamsByUser(user.user_id);
    teams = teamsRows;
  } catch (error) {
    console.error('Error fetching teams:', error);
  }

  if (teamId && startDate && endDate) {
    try {
      const [teamRows] = await db.execute('SELECT * FROM team WHERE team_id = ?', [teamId]);
      const team = teamRows[0];

      if (!team) {
        report = 'El equipo seleccionado no existe o no está accesible.';
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);

        report = await generateTeamReport(team, start, end);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      report = 'Error al generar el reporte. Revisa la consola para más detalles.';
    }
  }

  response.render('teamReport', {
    email: request.session.email || '',
    teams: teams,
    report: report,
    selectedTeamId: teamId || '',
    startDate: startDate || '',
    endDate: endDate || '',
  });
  
};

exports.get_project_report = (request, response, next) => {
  response.render('projectReport', {
    email: request.session.email || '',
  });
};

exports.get_reports = (request, response, next) => {
  response.render('reports', {
    email: request.session.email || '',
  });
};