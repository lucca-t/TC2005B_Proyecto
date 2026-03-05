exports.get_login = (request, response, next) => {
    response.render('login', {
        titulo: "Login - Daily Standup+", 
        username: request.session.username || '',
    });
};

exports.post_login = (request, response, next) => {
    request.session.username = request.body.username;
    request.session.password = request.body.password; 
    
    response.redirect('/prototype');
};

exports.logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/users/login'); 
    });
};