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
            'INSERT INTO standup (date, did_today, do_tomorrow, blockers, user_id) VALUES (?, ?, ?, ?, ?)',
            [this.date, this.did_today, this.do_tomorrow, this.blockers, this.user_id]
        );
    }

    static getUserId(email) {
        return db.execute(
            'SELECT user_id FROM user WHERE email = ?',
            [email]
        );
    }

    static checkDuplicate(user_id, date) {
        return db.execute(
            'SELECT standup_id FROM standup WHERE user_id = ? AND date = ?',
            [user_id, date]
        );
    }

    static getHistory(email) {
        return db.execute(
            `SELECT s.standup_id, s.date, s.did_today, s.do_tomorrow, s.blockers
             FROM standup s
             INNER JOIN user u ON s.user_id = u.user_id
             WHERE u.email = ?
             ORDER BY s.date DESC`,
            [email]
        );
    }

    static deleteRegister(standupId) {
        return db.execute(
            'DELETE FROM standup WHERE standup_id = ?',
            [standupId]
        );
    }

}

