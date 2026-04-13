// Requires

require('dotenv').config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: false,
  saveUninitialized: false,
}));

const csrf = require('csurf');
app.use(csrf());

// Expose session data to all views
app.use((req, res, next) => {
  res.locals.urlActual = req.path;
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.email = req.session.email || '';
  next();
});

// Routes
const route_login = require('./routes/login.routes');
const loginController = require('./controllers/login.controller');
const route_reports = require('./routes/reports.routes');
const route_teams = require('./routes/teams.routes');
const route_users = require('./routes/users.routes');
const route_projects = require('./routes/projects.routes');
const route_standup = require('./routes/daily_standup.routes');

app.use('/', (req, res, next) => {
  return req.path === '/' ? res.redirect('/login') : next();
});
app.use('/login', route_login);
app.get('/logout', loginController.get_logout);
app.use('/reports', route_reports);
app.use('/teams', route_teams);
app.use('/users', route_users);
app.use('/projects', route_projects);
app.use('/daily_standup', route_standup);


app.use((request, response, next) => {
  response.status(404).send('404 Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.code || err.status, err.message);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(
        'Invalid or expired CSRF token. Please reload the page and try again.',
    );
  }
  res.status(err.status || 500).send('Internal server error: ' + err.message);
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT);
