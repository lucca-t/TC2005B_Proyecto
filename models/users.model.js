const db = require('../util/database');
const bcrypt = require('bcrypt');

module.exports = class User {
  constructor(myEmail, myPassword, myFullName, mySlackHandle, mySlackId) {
    this.email = myEmail;
    this.password = myPassword;
    this.fullName = myFullName;
    this.slackHandle = mySlackHandle;
    this.slackId = mySlackId;
  }

  save() {
    return bcrypt.hash(this.password, 12).then((password_hash) => {
      return db.execute(
          `INSERT INTO user(email, password, full_name, slack_handle, slack_id) VALUES (?, ?, ?, ?, ?)`,
          [this.email, password_hash, this.fullName, this.slackHandle, this.slackId],
      ).then(([userResult]) => {
        return db.execute(
            `INSERT INTO user_role (user_id, role_id, start_date)
             SELECT ?, role_id, CURRENT_TIMESTAMP(6)
             FROM role
             WHERE role_name = 'Member'
             LIMIT 1`,
            [userResult.insertId],
        );
      });
    }).catch((error) => {
      console.log(error);
      throw error;
    });
  }

  static fetchOne(email) {
    return db.execute(
        `SELECT * FROM user WHERE email = ? AND deleted_at IS NULL`, [email],
    );
  }

  static getAll() {
    return db.execute(
        `SELECT user_id, email, password, full_name, slack_handle, slack_id FROM user WHERE deleted_at IS NULL`,
    );
  }

  static softDelete(userId) {
    return db.execute(
        `UPDATE user SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL`,
        [userId],
    );
  }

  static updateWithoutPassword(originalEmail, email, fullName, slackHandle, slackId) {
    return db.execute(
        `UPDATE user
            SET email = ?, full_name = ?, slack_handle = ?, slack_id = ?
            WHERE email = ? AND deleted_at IS NULL`,
        [email, fullName, slackHandle, slackId, originalEmail],
    );
  }

  static updateWithPassword(originalEmail, email, password, fullName, slackHandle, slackId) {
    return bcrypt.hash(password, 12).then((passwordHash) => {
      return db.execute(
          `UPDATE user
                SET email = ?, password = ?, full_name = ?, slack_handle = ?, slack_id = ?
                WHERE email = ? AND deleted_at IS NULL`,
          [email, passwordHash, fullName, slackHandle, slackId, originalEmail],
      );
    });
  }

  static getAllRoles() {
    return db.execute(`SELECT role_id, role_name FROM role ORDER BY role_name ASC`);
  }

  static getUserRole(userId) {
    return db.execute(
        `SELECT r.role_id, r.role_name
         FROM user_role ur
         INNER JOIN role r ON ur.role_id = r.role_id
         WHERE ur.user_id = ? AND ur.end_date IS NULL`,
        [userId],
    );
  }

  static assignRole(userId, roleId) {
    return db.execute(
        `UPDATE user_role SET end_date = CURRENT_TIMESTAMP(6) WHERE user_id = ? AND end_date IS NULL`,
        [userId],
    ).then(() => {
      return db.execute(
          `INSERT INTO user_role (user_id, role_id, start_date) VALUES (?, ?, CURRENT_TIMESTAMP(6))`,
          [userId, roleId],
      );
    });
  }

  static fetchById(userId) {
    return db.execute(
        `SELECT user_id, email, full_name, slack_handle, slack_id
         FROM user WHERE user_id = ? AND deleted_at IS NULL`,
        [userId],
    );
  }

  static getStandupsByDateRange(userId, startDate, endDate) {
    return db.execute(
        `SELECT s.standup_id, s.date, s.did_today, s.do_tomorrow, s.blockers
         FROM standup s
         WHERE s.user_id = ? AND s.date >= ? AND s.date <= ?
         ORDER BY s.date ASC`,
        [userId, startDate, endDate],
    );
  }

  static getVisibleUserIdsByViewer(viewerUserId) {
    return db.execute(
        `SELECT DISTINCT u.user_id
         FROM user u
         LEFT JOIN user_team ut_target
           ON u.user_id = ut_target.user_id
           AND ut_target.date_end IS NULL
         LEFT JOIN user_team ut_viewer
           ON ut_target.team_id = ut_viewer.team_id
           AND ut_viewer.user_id = ?
           AND ut_viewer.date_end IS NULL
         WHERE u.deleted_at IS NULL
           AND (u.user_id = ? OR ut_viewer.user_id IS NOT NULL)`,
        [viewerUserId, viewerUserId],
    );
  }

  static getAllWithRoles() {
    return db.execute(
        `SELECT u.user_id, u.email, u.full_name, u.slack_handle, u.slack_id,
                r.role_name,
                (
                    SELECT COUNT(DISTINCT MONTH(rp.date_generated))
                    FROM report rp
                    JOIN user_report urp
                      ON rp.report_id = urp.report_id
                    WHERE urp.user_about = u.user_id
                      AND QUARTER(rp.date_generated) = QUARTER(NOW())
                      AND YEAR(rp.date_generated)    = YEAR(NOW())
                      AND rp.deleted_at IS NULL
                ) AS quarterProgress
         FROM user u
         LEFT JOIN user_role ur ON u.user_id = ur.user_id
           AND ur.end_date IS NULL
         LEFT JOIN role r ON ur.role_id = r.role_id
         WHERE u.deleted_at IS NULL`,
    );
  }

  static searchByNameOrEmailWithRoles(query) {
    return db.execute(
        `SELECT u.user_id, u.email, u.full_name, u.slack_handle, u.slack_id,
                r.role_name,
                (
                    SELECT COUNT(DISTINCT MONTH(rp.date_generated))
                    FROM report rp
                    JOIN user_report urp
                      ON rp.report_id = urp.report_id
                    WHERE urp.user_about = u.user_id
                      AND QUARTER(rp.date_generated) = QUARTER(NOW())
                      AND YEAR(rp.date_generated)    = YEAR(NOW())
                      AND rp.deleted_at IS NULL
                ) AS quarterProgress
         FROM user u
         LEFT JOIN user_role ur ON u.user_id = ur.user_id
           AND ur.end_date IS NULL
         LEFT JOIN role r ON ur.role_id = r.role_id
         WHERE u.deleted_at IS NULL
           AND (u.email LIKE ? OR u.full_name LIKE ?)`,
        [`%${query}%`, `%${query}%`],
    );
  }

  static getRoleByEmail(email) {
    return db.execute(
        `SELECT r.role_id, r.role_name
         FROM user u
         INNER JOIN user_role ur ON u.user_id = ur.user_id AND ur.end_date IS NULL
         INNER JOIN role r ON ur.role_id = r.role_id
         WHERE u.email = ? AND u.deleted_at IS NULL
         LIMIT 1`,
        [email],
    );
  }
};
