//Requires

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

const session = require('express-session');
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
}));

const csrf = require('csurf');
const csrfProtection = csrf();
app.use(csrfProtection);

//This is so that the ejs can acces which page is in, mainly to change the navbar
app.use((req, res, next) => {
    res.locals.urlActual = req.path; 
    next();
});

//Routes

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const route_homepage = require('./routes/homepage.routes');
const route_login = require('./routes/login.routes');
const route_reports = require('./routes/reports.routes');
const route_teams = require('./routes/teams.routes');
const route_users = require('./routes/users.routes');
const route_standup = require('./routes/daily_standup.routes');

//App Uses

app.use('/homepage', route_homepage);
app.use('/login', route_login);
app.use('/logout', route_login);
app.use('/reports', route_reports);
app.use('/teams', route_teams);
app.use('/users', route_users);
app.use('/daily_standup', route_standup);

app.use((request, response, next) => {
    if (request.path === '/') {
        return response.redirect('/login');
    }
    next();
});


app.use((request, response, next) => {
    response.status(404).send('404 Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.code || err.status, err.message);
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).send('Invalid or expired CSRF token. Please reload the page and try again.');
    }
    res.status(err.status || 500).send('Internal server error: ' + err.message);
});

app.listen(3000);