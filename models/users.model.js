const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class User {

    constructor(myUsername, myPassword, myFullName, myUserState, mySlackHandle, mySlackId) {
    this.username = myUsername;
    this.password = myPassword;
    this.fullName = myFullName;
    this.userState = myUserState;
    this.slackHandle = mySlackHandle;
    this.slackId = mySlackId;
}

    save() {
        return bcrypt.hash(this.password, 12).then((password_hash) => {
            return db.execute(
            `INSERT INTO User(username, password, full_name, user_state, slack_handle, slack_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [this.username, password_hash, this.full_name, this.user_state, this.slack_handle, this.slack_id]
            );
        }).catch((error) => {
            console.log(error);
            throw error;
        });
    }
    
    static fetchOne(username) {
        return db.execute(
            `SELECT * FROM User WHERE username = ?`, [username]
        );
    }

    static getAll() {
        return db.execute(
            `SELECT username, password, full_name, user_state, slack_handle, slack_id FROM User`
        );
    }

}