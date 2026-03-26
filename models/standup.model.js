const db = require('../util/database');

module.exports = class Standup {

    constructor(date, did_today, do_tomorrow, blockers, user_id) {
        this.date = date;
        this.did_today = did_today;
        this.do_tomorrow = do_tomorrow;
        this.blockers = blockers;
        this.user_id = user_id;
    }

    save() {
        return db.execute(
            'INSERT INTO Standup (date, did_today, do_tomorrow, blockers, user_id) VALUES (?, ?, ?, ?, ?)',
            [this.date, this.did_today, this.do_tomorrow, this.blockers, this.user_id]
        );
    }

    static getUserId(username) {
        return db.execute(
            'SELECT user_id FROM User WHERE username = ?',
            [username]
        );
    }

    static checkDuplicate(user_id, date) {
        return db.execute(
            'SELECT standup_id FROM Standup WHERE user_id = ? AND date = ?',
            [user_id, date]
        );
    }
}
