const db = require('../util/database');

module.exports = class Reports {
  static listUserReports(userAboutId) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
						r.date_generated, r.user_id
				 FROM report r
				 INNER JOIN user_report ur ON ur.report_id = r.report_id
				 WHERE ur.user_about = ?
					 AND r.deleted_at IS NULL
				 ORDER BY r.date_generated DESC`,
        [userAboutId],
    );
  }

  static findUserReportByRange(userAboutId, startDate, endDate) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end, r.ai_content,
								r.date_generated
				 FROM report r
				 INNER JOIN user_report ur ON ur.report_id = r.report_id
				 WHERE ur.user_about = ?
					 AND r.date_beginning = ?
					 AND r.date_end = ?
					 AND r.deleted_at IS NULL
				 ORDER BY r.date_generated DESC
				 LIMIT 1`,
        [userAboutId, startDate, endDate],
    );
  }

  static findUserReportById(reportId, userAboutId) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end, r.ai_content,
								r.date_generated
				 FROM report r
				 INNER JOIN user_report ur ON ur.report_id = r.report_id
				 WHERE r.report_id = ?
					 AND ur.user_about = ?
					 AND r.deleted_at IS NULL
				 LIMIT 1`,
        [reportId, userAboutId],
    );
  }

  static async createUserReport({
    generatedByUserId,
    userAboutId,
    startDate,
    endDate,
    aiContent,
    standupIds,
  }) {
    const connection = await db.getConnection();
    const safeStandupIds = Array.isArray(standupIds) ? standupIds : [];

    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.execute(
          `SELECT r.report_id
					 FROM report r
					 INNER JOIN user_report ur ON ur.report_id = r.report_id
					 WHERE ur.user_about = ?
						 AND r.date_beginning = ?
						 AND r.date_end = ?
						 AND r.deleted_at IS NULL
					 ORDER BY r.date_generated DESC
					 LIMIT 1
					 FOR UPDATE`,
          [userAboutId, startDate, endDate],
      );

      if (existingRows.length > 0) {
        await connection.commit();
        return {report_id: existingRows[0].report_id};
      }

      const [insertResult] = await connection.execute(
          `INSERT INTO report(date_beginning, date_end, ai_content, user_id)
					 VALUES (?, ?, ?, ?)`,
          [startDate, endDate, aiContent, generatedByUserId || null],
      );

      const reportId = insertResult.insertId;

      await connection.execute(
          `INSERT INTO user_report(report_id, user_about)
					 VALUES (?, ?)`,
          [reportId, userAboutId],
      );

      for (const standupId of safeStandupIds) {
        await connection.execute(
            `INSERT INTO report_standup(report_id, standup_id)
						 VALUES (?, ?)`,
            [reportId, standupId],
        );
      }

      await connection.commit();
      return {report_id: reportId};
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static listTeamReports(teamId) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
				        r.date_generated, r.user_id
				 FROM report r
				 INNER JOIN team_report tr ON tr.report_id = r.report_id
				 WHERE tr.team_about = ?
				   AND r.deleted_at IS NULL
				 ORDER BY r.date_generated DESC`,
        [teamId],
    );
  }

  static findTeamReportByRange(teamId, startDate, endDate) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
				        r.ai_content, r.date_generated
				 FROM report r
				 INNER JOIN team_report tr ON tr.report_id = r.report_id
				 WHERE tr.team_about = ?
				   AND r.date_beginning = ?
				   AND r.date_end = ?
				   AND r.deleted_at IS NULL
				 ORDER BY r.date_generated DESC
				 LIMIT 1`,
        [teamId, startDate, endDate],
    );
  }

  static findTeamReportById(reportId, teamId) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
				        r.ai_content, r.date_generated
				 FROM report r
				 INNER JOIN team_report tr ON tr.report_id = r.report_id
				 WHERE r.report_id = ?
				   AND tr.team_about = ?
				   AND r.deleted_at IS NULL
				 LIMIT 1`,
        [reportId, teamId],
    );
  }

  static async createTeamReport({
    generatedByUserId,
    teamId,
    startDate,
    endDate,
    aiContent,
    standupIds,
  }) {
    const connection = await db.getConnection();
    const safeStandupIds = Array.isArray(standupIds) ? standupIds : [];

    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.execute(
          `SELECT r.report_id
					 FROM report r
					 INNER JOIN team_report tr ON tr.report_id = r.report_id
					 WHERE tr.team_about = ?
					   AND r.date_beginning = ?
					   AND r.date_end = ?
					   AND r.deleted_at IS NULL
					 ORDER BY r.date_generated DESC
					 LIMIT 1
					 FOR UPDATE`,
          [teamId, startDate, endDate],
      );

      if (existingRows.length > 0) {
        await connection.commit();
        return {report_id: existingRows[0].report_id};
      }

      const [insertResult] = await connection.execute(
          `INSERT INTO report(date_beginning, date_end, ai_content, user_id)
					 VALUES (?, ?, ?, ?)`,
          [startDate, endDate, aiContent, generatedByUserId || null],
      );

      const reportId = insertResult.insertId;

      await connection.execute(
          `INSERT INTO team_report(report_id, team_about)
					 VALUES (?, ?)`,
          [reportId, teamId],
      );

      for (const standupId of safeStandupIds) {
        await connection.execute(
            `INSERT INTO report_standup(report_id, standup_id)
						 VALUES (?, ?)`,
            [reportId, standupId],
        );
      }

      await connection.commit();
      return {report_id: reportId};
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static findProjectReportByRange(projectId, startDate, endDate) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
				        r.ai_content, r.date_generated
				 FROM report r
				 INNER JOIN project_report pr ON pr.report_id = r.report_id
				 WHERE pr.project_about = ?
				   AND r.date_beginning = ?
				   AND r.date_end = ?
				   AND r.deleted_at IS NULL
				 ORDER BY r.date_generated DESC
				 LIMIT 1`,
        [projectId, startDate, endDate],
    );
  }

  static findProjectReportById(reportId, projectId) {
    return db.execute(
        `SELECT r.report_id, r.date_beginning, r.date_end,
				        r.ai_content, r.date_generated
				 FROM report r
				 INNER JOIN project_report pr ON pr.report_id = r.report_id
				 WHERE r.report_id = ?
				   AND pr.project_about = ?
				   AND r.deleted_at IS NULL
				 LIMIT 1`,
        [reportId, projectId],
    );
  }

  static async createProjectReport({
    generatedByUserId,
    projectId,
    startDate,
    endDate,
    aiContent,
    standupIds,
  }) {
    const connection = await db.getConnection();
    const safeStandupIds = Array.isArray(standupIds) ? standupIds : [];

    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.execute(
          `SELECT r.report_id
					 FROM report r
					 INNER JOIN project_report pr ON pr.report_id = r.report_id
					 WHERE pr.project_about = ?
					   AND r.date_beginning = ?
					   AND r.date_end = ?
					   AND r.deleted_at IS NULL
					 ORDER BY r.date_generated DESC
					 LIMIT 1
					 FOR UPDATE`,
          [projectId, startDate, endDate],
      );

      if (existingRows.length > 0) {
        await connection.commit();
        return {report_id: existingRows[0].report_id};
      }

      const [insertResult] = await connection.execute(
          `INSERT INTO report(date_beginning, date_end, ai_content, user_id)
					 VALUES (?, ?, ?, ?)`,
          [startDate, endDate, aiContent, generatedByUserId || null],
      );

      const reportId = insertResult.insertId;

      await connection.execute(
          `INSERT INTO project_report(report_id, project_about)
					 VALUES (?, ?)`,
          [reportId, projectId],
      );

      for (const standupId of safeStandupIds) {
        await connection.execute(
            `INSERT INTO report_standup(report_id, standup_id)
						 VALUES (?, ?)`,
            [reportId, standupId],
        );
      }

      await connection.commit();
      return {report_id: reportId};
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
