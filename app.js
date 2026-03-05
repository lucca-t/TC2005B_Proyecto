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

//Rutes

const ruta_prototype = require('./routes/prototype.routes');
const ruta_users = require('./routes/users.routes');
app.use('/prototype', ruta_prototype);
app.use('/users', ruta_users);

app.use((request, response, next) => {
    response.status(404).send('404 Not Found');
})

app.listen(3000);