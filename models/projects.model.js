
const db = require('../util/database');

module.exports = class Project {
  static getTeams() {
    return db.execute(
        `SELECT team_id, team_name
             FROM team
             WHERE deleted_at IS NULL
             ORDER BY team_name ASC`,
    );
  }
/*
  static getProjects(userId) {
    return db.execute(
      `SELECT p.project_id, p.name, p.description, p.team_id, p.status, p.created_at, p.project_state, p.end_date
          FROM project p
          INNER JOIN team t ON p.team_id = t.team_id
          INNER JOIN team_member tm ON t.team_id = tm.team_id
          WHERE p.status = 'active' AND tm.user_id = ?
          ORDER BY p.created_at DESC`,
      [userId]
    );
  }
*/
  static findByNameAndTeam(name, teamId) {
    return db.execute(
        `SELECT project_id
                         FROM project
             WHERE LOWER(name) = LOWER(?)
               AND team_id = ?
             LIMIT 1`,
        [name, teamId],
    );
  }

  static async insert(projectData) {
    const {
      name,
      description,
      team_id,
      status,
      created_at,
    } = projectData;

    const [insertResult] = await db.execute(
        `INSERT INTO project(name, description, team_id, status, created_at, project_state)
             VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, team_id, status, created_at, status],
    );

    const [rows] = await db.execute(
        `SELECT project_id, name, description, team_id, status, created_at, project_state
             FROM project
             WHERE project_id = ?
             LIMIT 1`,
        [insertResult.insertId],
    );

    return rows[0];
  }
};
