const User = require('../models/users.model');
const Reports = require('../models/reports.model');
const {generateUserReport} = require('../util/ai-report');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDateForInput = (value) => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().split('T')[0];
};

const getSessionUserId = (request) => {
  const sessionEmail = (request.session.email || '').trim();
  if (!sessionEmail) {
    return Promise.resolve(null);
  }

  return User.fetchOne(sessionEmail)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return null;
        }

        return rows[0].user_id;
      })
      .catch(() => {
        return null;
      });
};

exports.get_list = (request, response, next) => {
  User.getAllWithRoles().then(([rows, fieldData]) => {
    const users = rows.map((row) => ({
      ...row,
      quarterProgress: row.quarterProgress || 0,
    }));
    response.render('userList', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      role: request.session.role || '',
      users,
    });
  })
      .catch((error) => {
        next(error);
      });
};

exports.getSearch = (request, response, next) => {
  const q = (request.query.q || '').trim().slice(0, 100);
  const fetchUsers = q
    ? User.searchByNameOrEmailWithRoles(q)
    : User.getAllWithRoles();
  fetchUsers.then(([rows]) => {
    const users = rows.map((row) => ({
      user_id: row.user_id,
      email: row.email,
      full_name: row.full_name,
      slack_handle: row.slack_handle,
      slack_id: row.slack_id,
      role_name: row.role_name,
      quarterProgress: row.quarterProgress || 0,
    }));
    return response.json({ users });
  }).catch((error) => next(error));
};

exports.get_add = (request, response, next) => {
  response.render('userAdd', {
    csrfToken: request.csrfToken(),
    email: request.session.email || '',
  });
};

exports.get_edit = (request, response, next) => {
  User.fetchOne(request.params.email)
      .then(([rows, fieldData]) => {
        response.render('userEdit', {
          user: rows[0],
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
        });
      })
      .catch((error) => {
        next(error);
      });
};

exports.post_add = (request, response, next) => {
  const {
    email,
    password,
    full_name,
    slack_handle,
    slack_id,
  } = request.body;

  if (!EMAIL_REGEX.test((email || '').trim())) {
    return response.status(400).render('userAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'Email format is invalid. Please use a valid email address.',
    });
  }

  const user = new User(
      email,
      password,
      full_name,
      slack_handle,
      slack_id,
  );

  user.save()
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error(
            '[POST /users/add] Failed to save user:',
            error.sqlMessage || error.message,
        );
        response.status(400).render('userAdd', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          error: 'Error creating user: ' +
            (error.sqlMessage || error.message || 'Unknown error'),
        });
      });
};

exports.post_edit = (request, response, next) => {
  const originalEmail = request.params.email;
  const {
    email,
    full_name,
    slack_handle,
    slack_id,
  } = request.body;

  const normalizedEmail = (email || '').trim();
  const normalizedFullName = (full_name || '').trim();
  const normalizedSlackHandle = (slack_handle || '').trim();
  const normalizedSlackId = (slack_id || '').trim();

  if (
    !normalizedEmail || !normalizedFullName ||
    !normalizedSlackHandle || !normalizedSlackId
  ) {
    return response.status(400).render('userEdit', {
      user: {
        email: normalizedEmail,
        full_name: normalizedFullName,
        slack_handle: normalizedSlackHandle,
        slack_id: normalizedSlackId,
      },
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'All fields are required. None can be empty.',
    });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return response.status(400).render('userEdit', {
      user: {
        email: normalizedEmail,
        full_name: normalizedFullName,
        slack_handle: normalizedSlackHandle,
        slack_id: normalizedSlackId,
      },
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'Email format is invalid. Please use a valid email address.',
    });
  }

  const updatePromise = User.updateWithoutPassword(
      originalEmail,
      normalizedEmail,
      normalizedFullName,
      normalizedSlackHandle,
      normalizedSlackId,
  );

  updatePromise
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error(
            '[POST /users/edit] Failed to update user:',
            error.sqlMessage || error.message,
        );
        response.status(400).render('userEdit', {
          user: {
            email: normalizedEmail,
            full_name: normalizedFullName,
            slack_handle: normalizedSlackHandle,
            slack_id: normalizedSlackId,
          },
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          error: 'Error updating user: ' +
            (error.sqlMessage || error.message || 'Unknown error'),
        });
      });
};

exports.post_delete = (request, response, next) => {
  const userId = request.params.userId;

  User.softDelete(userId)
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error(
            '[POST /users/delete] Failed to delete user:',
            error.sqlMessage || error.message,
        );
        next(error);
      });
};

exports.get_role = (request, response, next) => {
  const userId = request.params.userId;

  Promise.all([
    User.getUserRole(userId),
    User.getAllRoles(),
    User.getAll(),
  ])
      .then(([[roleRows], [roles], [allUsers]]) => {
        const currentRole = roleRows.length > 0 ? roleRows[0] : null;
        const user = allUsers.find(
            (u) => String(u.user_id) === String(userId),
        ) || {user_id: userId, email: '', full_name: ''};

        response.render('userRole', {
          csrfToken: request.csrfToken(),
          email: request.session.email || '',
          user: user,
          currentRole: currentRole,
          roles: roles,
        });
      })
      .catch((error) => {
        console.error(
            '[GET /users/role] Failed to load role page:',
            error.message,
        );
        next(error);
      });
};

exports.post_role = (request, response, next) => {
  const userId = request.params.userId;
  const {role_id} = request.body;

  if (!role_id) {
    return response.redirect(`/users/role/${userId}`);
  }

  User.assignRole(userId, role_id)
      .then(() => {
        return response.redirect('/users/list');
      })
      .catch((error) => {
        console.error(
            '[POST /users/role] Failed to assign role:',
            error.message,
        );
        next(error);
      });
};

exports.get_report = (request, response, next) => {
  const userId = request.params.userId;
  const reportId = Number(request.query.reportId) || 0;

  User.fetchById(userId)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/users/list');
        }

        const user = rows[0];

        if (!reportId) {
          return response.render('userReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            user: user,
            report: null,
            error: null,
            startDate: '',
            endDate: '',
            reportType: '',
          });
        }

        return Reports.findUserReportById(reportId, userId)
            .then(([reportRows]) => {
              if (!reportRows || reportRows.length === 0) {
                return response.render('userReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  user: user,
                  report: null,
                  error: 'Saved report not found for this user.',
                  startDate: '',
                  endDate: '',
                  reportType: '',
                });
              }

              const savedReport = reportRows[0];
              return response.render('userReport', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                user: user,
                report: savedReport.ai_content,
                error: null,
                startDate: formatDateForInput(savedReport.date_beginning),
                endDate: formatDateForInput(savedReport.date_end),
                reportType: '',
              });
            });
      })
      .catch((error) => {
        console.error(
            '[GET /users/report] Failed to fetch user:',
            error.message,
        );
        next(error);
      });
};

exports.get_my_report_history = (request, response, next) => {
  const sessionEmail = (request.session.email || '').trim();
  if (!sessionEmail) {
    return response.redirect('/users/list');
  }

  return User.fetchOne(sessionEmail)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.redirect('/users/list');
        }

        const sessionUserId = rows[0].user_id;
        return response.redirect(`/users/report/${sessionUserId}/history`);
      })
      .catch((error) => {
        console.error(
            '[GET /users/report/history] Failed to resolve session user:',
            error.message,
        );
        next(error);
      });
};

exports.get_report_history = (request, response, next) => {
  const userId = request.params.userId;

  User.fetchById(userId)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/users/list');
        }

        const user = rows[0];
        return Reports.listUserReports(userId)
            .then(([reportRows]) => {
              return response.render('userReportHistory', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                user: user,
                reports: reportRows || [],
              });
            });
      })
      .catch((error) => {
        console.error(
            '[GET /users/report/history] Failed to fetch reports:',
            error.message,
        );
        next(error);
      });
};

exports.post_report = (request, response, next) => {
  const userId = request.params.userId;
  const {report_type, start_date, end_date} = request.body;

  User.fetchById(userId)
      .then(([rows]) => {
        if (!rows || rows.length === 0) {
          return response.status(404).redirect('/users/list');
        }
        const user = rows[0];

        const renderError = (msg) => {
          return response.status(400).render('userReport', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            user: user,
            report: null,
            error: msg,
            startDate: start_date || '',
            endDate: end_date || '',
            reportType: report_type || '',
          });
        };

        if (!report_type) {
          return renderError(
              'Please select at least one quarter or use the ' +
              'custom date range.',
          );
        }

        let startDate;
        let endDate;

        if (report_type === 'custom') {
          if (!start_date || !end_date) {
            return renderError(
                'Both start date and end date are required ' +
                'for a custom report.',
            );
          }
          startDate = new Date(start_date + 'T00:00:00');
          endDate = new Date(end_date + 'T00:00:00');

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return renderError('Invalid date format. Please use valid dates.');
          }

          if (startDate > endDate) {
            return renderError('Start date cannot be after end date.');
          }
        } else {
          // Quarter-based format: "2026-Q1" or "2026-Q1,2025-Q4".
          const quarters = report_type
              .split(',')
              .map((q) => q.trim())
              .filter(Boolean);
          if (quarters.length === 0) {
            return renderError('Please select at least one quarter.');
          }

          const parsed = [];
          for (const q of quarters) {
            const match = q.match(/^(\d{4})-Q([1-4])$/);
            if (!match) {
              return renderError('Invalid quarter format: ' + q);
            }
            const year = parseInt(match[1]);
            const qNum = parseInt(match[2]);
            parsed.push({year, quarter: qNum});
          }

          // Find the overall min start and max end from selected quarters
          let minStart = null;
          let maxEnd = null;
          for (const p of parsed) {
            const qStart = new Date(p.year, (p.quarter - 1) * 3, 1);
            const qEnd = new Date(p.year, p.quarter * 3, 0);
            if (!minStart || qStart < minStart) minStart = qStart;
            if (!maxEnd || qEnd > maxEnd) maxEnd = qEnd;
          }
          startDate = minStart;
          endDate = maxEnd;
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        return User.getStandupsByDateRange(userId, startStr, endStr)
            .then(([standups]) => {
              if (!standups || standups.length === 0) {
                return response.status(400).render('userReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  user: user,
                  report: null,
                  error: 'No daily standups found for ' +
                    (user.full_name || user.email) +
                    ' between ' + startStr + ' and ' + endStr +
                    '. A report cannot be generated without standup data.',
                  startDate: start_date || startStr,
                  endDate: end_date || endStr,
                  reportType: report_type,
                });
              }

              return Reports.findUserReportByRange(userId, startStr, endStr)
                  .then(([existingReports]) => {
                    if (existingReports && existingReports.length > 0) {
                      const existingReport = existingReports[0];
                      return response.redirect(
                          '/users/report/' + userId +
                          '?reportId=' + existingReport.report_id,
                      );
                    }

                    return generateUserReport(
                        user,
                        startDate,
                        endDate,
                        standups,
                    )
                        .then((reportText) => {
                          const standupIds = standups.map(
                              (row) => row.standup_id,
                          );

                          return getSessionUserId(request)
                              .then((sessionUserId) => {
                                return Reports.createUserReport({
                                  generatedByUserId: sessionUserId,
                                  userAboutId: userId,
                                  startDate: startStr,
                                  endDate: endStr,
                                  aiContent: reportText,
                                  standupIds,
                                })
                                    .then((created) => {
                                      return response.redirect(
                                          '/users/report/' + userId +
                                          '?reportId=' + created.report_id,
                                      );
                                    });
                              });
                        });
                  });
            })
            .catch((aiError) => {
              console.error(
                  '[POST /users/report] AI generation failed:',
                  aiError.message,
              );
              response.render('userReport', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                user: user,
                report: null,
                error: 'Failed to generate AI report: ' +
                  (aiError.message || 'Unknown error'),
                startDate: start_date || '',
                endDate: end_date || '',
                reportType: report_type,
              });
            });
      })
      .catch((error) => {
        console.error(
            '[POST /users/report] Failed to fetch user:',
            error.message,
        );
        next(error);
      });
};
