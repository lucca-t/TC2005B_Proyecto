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
            FROM Team
            WHERE deleted_at IS NULL`
        );
    }

    static getAllWithMemberCount() {
        return db.execute(`
            SELECT 
                t.team_id,
                t.team_name,
                t.team_start_date,
                COUNT(ut.user_id) as memberCount
            FROM Team t
            LEFT JOIN User_Team ut ON t.team_id = ut.team_id
            WHERE t.deleted_at IS NULL
            GROUP BY t.team_id, t.team_name, t.team_start_date
            ORDER BY t.team_name ASC`
        );
    }

    static addMembersToTeam(teamId, memberIds) {
        if (!memberIds || memberIds.length === 0) {
            return Promise.resolve();
        }

        const dateStart = new Date().toISOString().split('T')[0];
        
        // Insert all members sequentially
        return memberIds.reduce((promise, memberId) => {
            return promise.then(() => {
                return db.execute(
                    `INSERT INTO User_Team(user_id, team_id, date_start) VALUES (?, ?, ?)`,
                    [parseInt(memberId), teamId, dateStart]
                ).catch(error => {
                    console.error(`Failed to add member ${memberId} to team ${teamId}:`, error.message);
                    throw error;
                });
            });
        }, Promise.resolve());
    }

}