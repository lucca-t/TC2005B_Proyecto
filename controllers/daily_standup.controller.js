const Standup = require('../models/standup.model');

exports.get_standup_form = (request, response, next) => {
    const error = request.session.error || '';
    const success = request.session.success || '';
    request.session.error = '';
    request.session.success = '';

    response.render('daily_standup', {
        csrfToken: request.csrfToken(),
        error: error,
        success: success,
        title: 'Register activity - Daily Standup+',
        email: request.session.email || '',
    });
};

exports.post_standup = (request, response, next) => {
    if (!request.session.email) {
        return response.redirect('/users/login');
    }

    const { did_today, do_tomorrow, blockers } = request.body;

    if (!did_today || !did_today.trim() || !do_tomorrow || !do_tomorrow.trim()) {
        request.session.error = 'Please fill in the required fields: What did you do today? and What will you do tomorrow?';
        return response.redirect('/daily_standup');
    }

    const email = request.session.email;
<<<<<<< HEAD
    const selectedDate = request.body.date || new Date().toISOString().split('T')[0];
    
=======
    const today = new Date().toISOString().split('T')[0];

>>>>>>> cesar/ind
    Standup.getUserId(email)
        .then(([rows]) => {
            if (rows.length === 0) {
                request.session.error = 'User not found';
                return response.redirect('/daily_standup');
            }

            const user_id = rows[0].user_id;

<<<<<<< HEAD
            return Standup.checkDuplicate(user_id, selectedDate)
=======
            return Standup.checkDuplicate(user_id, today)
>>>>>>> cesar/ind
                .then(([existing]) => {
                    if (existing.length > 0) {
                        request.session.error = 'A standup report already exists for today';
                        return response.redirect('/daily_standup');
                    }

<<<<<<< HEAD
                    const standup = new Standup(selectedDate, did_today.trim(), do_tomorrow.trim(), (blockers || '').trim(), user_id);
=======
                    const standup = new Standup(today, did_today.trim(), do_tomorrow.trim(), (blockers || '').trim(), user_id);
>>>>>>> cesar/ind
                    return standup.save()
                        .then(() => {
                            request.session.success = 'Process completed. Your daily activity has been successfully registered';
                            return response.redirect('/daily_standup');
                        });
                });
        })
        .catch((err) => {
            console.error('Error saving standup:', err);
            request.session.error = 'An error occurred while saving your activity. Please try again';
            return response.redirect('/daily_standup');
        });
};

exports.get_standup_history = (request, response, next) => {
    if (!request.session.email) {
        return response.redirect('/users/login');
    }
 
    const email = request.session.email;
 
    Standup.getHistory(email)
        .then(([rows]) => {
            response.render('standup_history', {
                csrfToken: request.csrfToken(),
                title: 'Activity History - Daily Standup+',
                email: email,
                standups: rows,
            });
        })
        .catch((err) => {
            console.error('Error fetching standup history:', err);
            response.render('standup_history', {
                csrfToken: request.csrfToken(),
                title: 'Activity History - Daily Standup+',
                email: email,
                standups: [],
                error: 'Server connection error. Please try again later.',
            });
        });
};