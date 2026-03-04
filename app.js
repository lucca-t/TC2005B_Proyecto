//Requires

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Rutes

const ruta_prototype = require('./routes/prototype.routes');
app.use('/prototype', ruta_prototype);

app.set('view engine', 'ejs');
app.set('views', 'views');

const session = require('express-session');
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false
}));

app.use((request, response, next) => {
    response.status(404).send('404 Not Found');
})

app.listen(3000);