
const db = require('../util/database');

module.exports = class Project {
  static getTeams(userId) {
    return db.execute(
        `SELECT t.team_id, t.team_name
             FROM team t
             INNER JOIN user_team ut ON t.team_id = ut.team_id
             WHERE t.deleted_at IS NULL
               AND ut.date_end IS NULL
               AND ut.user_id = ?
             ORDER BY t.team_name ASC`,
        [userId],
    );
  }

  static getProjects(userId) {
    return db.execute(
        `SELECT project_id, name, description, status, created_at,
          project_state, end_date
         FROM project
         WHERE status = 'active'
           AND team_id IN (
             SELECT ut.team_id
             FROM user_team ut
             WHERE ut.user_id = ?
               AND ut.date_end IS NULL
           )
         ORDER BY created_at DESC`,
        [userId],
    );
  }

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
        `INSERT INTO project(
            name, description, team_id, status, created_at,
            project_state)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, team_id, status, created_at, status],
    );

    const [rows] = await db.execute(
        `SELECT project_id, name, description, team_id, status, created_at,
            project_state
         FROM project
         WHERE project_id = ?
         LIMIT 1`,
        [insertResult.insertId],
    );

    return rows[0];
  }
};
