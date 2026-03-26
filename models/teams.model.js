const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class Team {

    constructor(myTeamId, myTeamName, myTeamStartDate, myTeamDeletedAt, myTeamCreatedAt) {
        this.teamId = myTeamId;
        this.teamName = myTeamName;
        this.teamStartDate = myTeamStartDate;
        this.teamDeletedAt = myTeamDeletedAt;
        this.teamCreatedAt = myTeamCreatedAt;
    }

    save() {
        return db.execute(
            `INSERT INTO Team(team_id, team_name) VALUES (?, ?)`,
            [this.teamId, this.teamName]
        );
    }

    // missing
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