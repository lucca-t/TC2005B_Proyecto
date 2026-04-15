const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class Team {
  constructor(myTeamName) {
    this.teamName = myTeamName;
  }

  save() {
    return db.execute(
        `INSERT INTO team(team_name) VALUES (?)`,
        [this.teamName],
    );
  }

  static fetchOne(team_idSearch) {
    return db.execute(
        `SELECT * FROM team WHERE team_id = ?`, [team_idSearch],
    );
  }

  static getAll() {
    return db.execute(`
            SELECT team_id, team_name, team_start_date, deleted_at 
            FROM team
            WHERE deleted_at IS NULL`,
    );
  }

  static getAllWithMemberCount() {
    return db.execute(`
            SELECT 
                t.team_id,
                t.team_name,
                t.team_start_date,
                COUNT(ut.user_id) as memberCount
            FROM team t
            LEFT JOIN user_team ut ON t.team_id = ut.team_id AND ut.date_end IS NULL
            WHERE t.deleted_at IS NULL
            GROUP BY t.team_id, t.team_name, t.team_start_date
            ORDER BY t.team_name ASC`,
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
            `INSERT INTO user_team(user_id, team_id, date_start) VALUES (?, ?, ?)`,
            [parseInt(memberId), teamId, dateStart],
        ).catch((error) => {
          console.error(`Failed to add member ${memberId} to team ${teamId}:`, error.message);
          throw error;
        });
      });
    }, Promise.resolve());
  }

  static delete(teamId) {
    return db.execute(
        `UPDATE team SET deleted_at = NOW() WHERE team_id = ?`,
        [teamId],
    );
  }

  static getTeamsDetails(teamId) {
    return db.execute(
        `
            CALL getTeamDetails(?)
            `, [teamId],
    );
  }

  static updateTeamName(teamId, newTeamName) {
    return db.execute(
        `UPDATE team SET team_name = ? WHERE team_id = ?`,
        [newTeamName, teamId],
    );
  }

  static updateTeamMembers(teamId, newUsers) {
    // newUsers is a comma-separated string of user IDs (e.g., "1,2,5,9" or empty string "")
    // We need to convert it to a JSON array format for the stored procedure

    let userIdsArray = [];
    if (newUsers && newUsers.trim() !== '') {
      userIdsArray = newUsers.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
    }

    // Convert to JSON array string, e.g., '[1, 2, 5]' or '[]'
    const userIdsJson = JSON.stringify(userIdsArray);

    return db.execute(
        `CALL updateTeamMembers(?, ?)`,
        [teamId, userIdsJson],
    );
  }

  static findByName(teamName) {
    return db.execute(
        `SELECT team_id, team_name FROM team WHERE team_name = ? AND deleted_at IS NULL`,
        [teamName.trim()],
    );
  }

  static selectLast3reports(teamId) {
    return db.execute(
        ` SELECT *
          FROM report r
          WHERE r.report_id IN
          (SELECT tr.report_id
          FROM team_report tr
          WHERE tr.team_about = ?)
          ORDER BY r.date_generated DESC
          LIMIT 3`,
        [teamId],
    );
  }
};
