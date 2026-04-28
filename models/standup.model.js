const db = require('../util/database');

module.exports = class Standup {
  constructor(date, did_today, do_tomorrow, blockers, user_id) {
    this.date = date;
    this.did_today = did_today;
    this.do_tomorrow = do_tomorrow;
    this.blockers = blockers;
    this.user_id = user_id;
  }

  save() {
    return db.execute(
        'INSERT INTO standup (date, did_today, do_tomorrow, blockers, user_id) VALUES (?, ?, ?, ?, ?)',
        [this.date, this.did_today, this.do_tomorrow, this.blockers, this.user_id],
    );
  }

  static getUserId(email) {
    return db.execute(
        'SELECT user_id FROM user WHERE email = ? AND deleted_at IS NULL',
        [email],
    );
  }

  static getUserIdBySlackId(slackId) {
    return db.execute(
        'SELECT user_id FROM user WHERE slack_id = ? AND deleted_at IS NULL',
        [slackId],
    );
  }

  static getUserIdByDisplayName(displayName) {
    return db.execute(
        `SELECT user_id
         FROM user
         WHERE deleted_at IS NULL
           AND (
             LOWER(REPLACE(COALESCE(slack_handle, ''), '@', '')) = LOWER(?)
             OR LOWER(COALESCE(full_name, '')) = LOWER(?)
           )
         LIMIT 1`,
        [displayName, displayName],
    );
  }

  static checkDuplicate(user_id, date) {
    return db.execute(
        'SELECT standup_id FROM standup WHERE user_id = ? AND date = ?',
        [user_id, date],
    );
  }

  static getHistory(email) {
    return db.execute(
        `SELECT s.standup_id, s.date, s.did_today, s.do_tomorrow, s.blockers
            FROM standup s
            INNER JOIN user u ON s.user_id = u.user_id
            WHERE u.email = ? AND u.deleted_at IS NULL
            ORDER BY s.date DESC`,
        [email],
    );
  }

  static getHistoryByUserId(userId) {
    return db.execute(
        `SELECT s.standup_id, s.date, s.did_today, s.do_tomorrow, s.blockers
            FROM standup s
            WHERE s.user_id = ?
            ORDER BY s.date DESC`,
        [userId],
    );
  }

  static getTeamHistory(teamId, filters = {}) {
    const queryParts = [
      `SELECT s.standup_id, s.date, s.did_today, s.do_tomorrow, s.blockers,
              u.user_id, u.full_name, u.email
       FROM standup s
       INNER JOIN user u ON s.user_id = u.user_id AND u.deleted_at IS NULL
       INNER JOIN user_team ut
         ON ut.user_id = u.user_id
        AND ut.team_id = ?
        AND ut.date_end IS NULL`,
      'WHERE 1 = 1',
    ];

    const params = [teamId];

    if (filters.userId) {
      queryParts.push('AND u.user_id = ?');
      params.push(filters.userId);
    }

    if (filters.date) {
      queryParts.push('AND s.date = ?');
      params.push(filters.date);
    }

    queryParts.push('ORDER BY s.date DESC, u.full_name ASC');

    return db.execute(queryParts.join('\n'), params);
  }
  static deleteRegister(standupId) {
    return db.execute(
        'DELETE FROM standup WHERE standup_id = ?',
        [standupId],
    );
  }

  static findById(standupId) {
    return db.execute(
        'SELECT * FROM standup WHERE standup_id = ?',
        [standupId],
    );
  }

  static update(standupId, date, did_today, do_tomorrow, blockers) {
    return db.execute(
        'UPDATE standup SET date = ?, did_today = ?, do_tomorrow = ?, blockers = ? WHERE standup_id = ?',
        [date, did_today, do_tomorrow, blockers, standupId],
    );
  }
};

