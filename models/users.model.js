const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class User {

    constructor(myEmail, myPassword, myFullName, mySlackHandle, mySlackId) {
    this.email = myEmail;
    this.password = myPassword;
    this.fullName = myFullName;
    this.slackHandle = mySlackHandle;
    this.slackId = mySlackId;
}

    save() {
        return bcrypt.hash(this.password, 12).then((password_hash) => {
            return db.execute(
            `INSERT INTO User(email, password, full_name, slack_handle, slack_id) VALUES (?, ?, ?, ?, ?)`,
            [this.email, password_hash, this.fullName, this.slackHandle, this.slackId]
            );
        }).catch((error) => {
            console.log(error);
            throw error;
        });
    }
    
    static fetchOne(email) {
        return db.execute(
            `SELECT * FROM User WHERE email = ?`, [email]
        );
    }

    static getAll() {
        return db.execute(
            `SELECT user_id, email, password, full_name, slack_handle, slack_id FROM User WHERE deleted_at IS NULL`
        );
    }

    static updateWithoutPassword(originalEmail, email, fullName, slackHandle, slackId) {
        return db.execute(
            `UPDATE User
            SET email = ?, full_name = ?, slack_handle = ?, slack_id = ?
            WHERE email = ?`,
            [email, fullName, slackHandle, slackId, originalEmail]
        );
    }

    static updateWithPassword(originalEmail, email, password, fullName, slackHandle, slackId) {
        return bcrypt.hash(password, 12).then((passwordHash) => {
            return db.execute(
                `UPDATE User
                SET email = ?, password = ?, full_name = ?, slack_handle = ?, slack_id = ?
                WHERE email = ?`,
                [email, passwordHash, fullName, slackHandle, slackId, originalEmail]
            );
        });
    }

}