const Prototype = require('../models/prototype.model');

exports.get_prototype = (request, response, next) => {
    response.render('prototype', {
    });
};