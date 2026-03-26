const Homepage = require('../models/homepage.model');

exports.get_homepage = ((request, response, next) => {
    response.render('landing_page', {
        email: request.session.email || '',
    });
});