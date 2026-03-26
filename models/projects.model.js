const db = require('../util/database');

module.exports = class Project {
    static getTeams() {
        return db.execute(
            `SELECT team_id, team_name
             FROM Team
             WHERE deleted_at IS NULL
             ORDER BY team_name ASC`
        );
    }

    static findByNameAndTeam(name, teamId) {
        return db.execute(
            `SELECT project_id
             FROM Project
             WHERE LOWER(name) = LOWER(?)
               AND team_id = ?
             LIMIT 1`,
            [name, teamId]
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
            `INSERT INTO Project(name, description, team_id, status, created_at, project_state)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, team_id, status, created_at, status]
        );

        const [rows] = await db.execute(
            `SELECT project_id, name, description, team_id, status, created_at, project_state
             FROM Project
             WHERE project_id = ?
             LIMIT 1`,
            [insertResult.insertId]
        );

        return rows[0];
    }
};
