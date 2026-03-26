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
        username: request.session.username || '',
    });
};

exports.post_standup = (request, response, next) => {
    if (!request.session.username) {
        return response.redirect('/users/login');
    }

    const { did_today, do_tomorrow, blockers } = request.body;

    if (!did_today || !did_today.trim() || !do_tomorrow || !do_tomorrow.trim()) {
        request.session.error = 'Please fill in the required fields: What did you do today? and What will you do tomorrow?';
        return response.redirect('/daily_standup');
    }

    const username = request.session.username;
    const today = new Date().toISOString().split('T')[0];

    Standup.getUserId(username)
        .then(([rows]) => {
            if (rows.length === 0) {
                request.session.error = 'User not found';
                return response.redirect('/daily_standup');
            }

            const user_id = rows[0].user_id;

            return Standup.checkDuplicate(user_id, today)
                .then(([existing]) => {
                    if (existing.length > 0) {
                        request.session.error = 'A standup report already exists for today';
                        return response.redirect('/daily_standup');
                    }

                    const standup = new Standup(today, did_today.trim(), do_tomorrow.trim(), (blockers || '').trim(), user_id);
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
