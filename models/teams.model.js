const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class Team {

    constructor(myTeamName) {
        this.teamName = myTeamName;
    }

    save() {
        return db.execute(
            `INSERT INTO Team(team_name) VALUES (?)`,
            [this.teamName]
        );
    }

    static fetchOne(team_idSearch) {
        return db.execute(
            `SELECT * FROM Team WHERE team_id = ?`, [team_idSearch]
        );
    }
    
    static getAll() {
        return db.execute(`
            SELECT team_id, team_name, team_start_date, deleted_at 
            FROM User
            WHERE deleted_at IS NULL`
        );
    }

}