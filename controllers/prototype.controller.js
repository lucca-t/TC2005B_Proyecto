const Prototype = require('../models/prototype.model');

exports.get_prototype = ((request, response, next) => {
    response.render('landing_page', {
        username: request.session.username || '',
    });
});