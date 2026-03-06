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

//This is so that the ejs can acces which page is in, mainly to change the navbar
app.use((req, res, next) => {
    res.locals.urlActual = req.path; 
    next();
});

//Rutes

const ruta_prototype = require('./routes/prototype.routes');
const ruta_users = require('./routes/users.routes');
app.use('/prototype', ruta_prototype);
app.use('/users', ruta_users);
const ruta_reports = require('./routes/reports.routes');
app.use('/reports', ruta_reports);

app.use((request, response, next) => {
    response.status(404).send('404 Not Found');
})

app.listen(3000);