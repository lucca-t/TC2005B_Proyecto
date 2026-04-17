const db = require('../util/database');

module.exports = class Reports {
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
};
