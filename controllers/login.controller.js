const User = require('../models/users.model');
const bcrypt = require('bcrypt');

exports.get_login = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('login', {
        csrfToken: request.csrfToken(),
        error: error,
        title: "Login - Daily Standup+", 
        email: request.session.email || '',
    });
};

exports.post_login = (request, response, next) => {
    User.fetchOne(request.body.email).then(([users, fieldData]) => {
        if (users.length === 0) {
            request.session.error = "Invalid email or password.";
            return response.redirect('/login');
        }
        bcrypt.compare(request.body.password, users[0].password).then((doMatch) => {
            if (!doMatch) {
                request.session.error = "Invalid email or password.";
                return response.redirect('/login');
            }
            request.session.isLoggedIn = true;
            request.session.email = request.body.email;
            return request.session.save(() => {
                return response.redirect('/homepage');
            });
        }).catch((error) => {
            console.error('[POST /login] bcrypt error:', error.message);
            next(error);
        });
    }).catch((error) => {
        console.error('[POST /login] DB error:', error.message);
        next(error);
    });
};

exports.get_logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/login'); 
    });
};
 