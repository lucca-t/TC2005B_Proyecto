const Team = require('../models/teams.model');
const User = require('../models/users.model');
const Reports = require('../models/reports.model');
const {generateTeamReport} = require('../util/ai-report');
const {ROLES, normalizeRole} = require('../util/rbac');

exports.getList = (request, response, next) => {
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  const currentUserTeamsPromise = getSessionUserId(request)
      .then((sessionUserId) => {
        if (!sessionUserId) return [];
        return Team.getTeamsByUser(sessionUserId)
            .then(([userTeams]) => userTeams || []);
      });

  Promise.all([Team.getAllWithMemberCount(), currentUserTeamsPromise])
      .then(([[rows], userTeams]) => {
        const userRole = normalizeRole(request.session.role);
        const currentUserTeamIds = new Set(
            userTeams
                .map((team) => parseInt(team.team_id))
                .filter((id) => !isNaN(id)),
        );

        const mappedTeams = rows.map((row) => ({
          id: row.team_id,
          name: row.team_name,
          startDate: row.team_start_date,
          memberCount: row.memberCount || 0,
          quarterProgress: row.quarterProgress || 0,
          isCurrentUserTeam: currentUserTeamIds.has(parseInt(row.team_id)),
        }));

        const teams = userRole === ROLES.ADMIN ?
          mappedTeams :
          mappedTeams.filter((team) => team.isCurrentUserTeam);

        response.render('teamList', {
          csrfToken: request.csrfToken(),
          error: error,
          success: success,
          email: request.session.email || '',
          teams: teams,
        });
      })
      .catch((error) => {
        console.error('[GET /teams/list] Failed to fetch teams:', error.message);
        response.render('teamList', {
          csrfToken: request.csrfToken(),
          error: 'Error loading teams.',
          success: '',
          email: request.session.email || '',
          teams: [],
        });
      });
};

exports.getSearch = (request, response, next) => {
  const q = (request.query.q || '').trim().slice(0, 100);

  const fetchTeams = q ?
    Team.searchByNameWithMemberCount(q) :
    Team.getAllWithMemberCount();

  const currentUserTeamsPromise = getSessionUserId(request)
      .then((sessionUserId) => {
        if (!sessionUserId) return [];
        return Team.getTeamsByUser(sessionUserId)
            .then(([userTeams]) => userTeams || []);
      });

  Promise.all([fetchTeams, currentUserTeamsPromise])
      .then(([[rows], userTeams]) => {
        const userRole = normalizeRole(request.session.role);
        const currentUserTeamIds = new Set(
            userTeams
                .map((team) => parseInt(team.team_id))
                .filter((id) => !isNaN(id)),
        );

        const mappedTeams = rows.map((row) => ({
          id: row.team_id,
          name: row.team_name,
          memberCount: row.memberCount || 0,
          quarterProgress: row.quarterProgress || 0,
          isCurrentUserTeam: currentUserTeamIds.has(parseInt(row.team_id)),
        }));

        const teams = userRole === ROLES.ADMIN ?
          mappedTeams :
          mappedTeams.filter((team) => team.isCurrentUserTeam);

        return response.json({teams});
      })
      .catch((err) => {
        console.error('[GET /teams/search] Failed to search teams:', err.message);
        return response.status(500).json({error: 'Error searching teams.'});
      });
};

const formatDateForInput = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const compareUsersByNameThenEmail = (a, b) => {
  const nameA = (a.full_name || '').trim().toLowerCase();
  const nameB = (b.full_name || '').trim().toLowerCase();
  const byName = nameA.localeCompare(nameB);
  if (byName !== 0) return byName;

  const emailA = (a.email || '').trim().toLowerCase();
  const emailB = (b.email || '').trim().toLowerCase();
  return emailA.localeCompare(emailB);
};

const sortUsersWithTeamMembersFirst = (users, members) => {
  const memberIdSet = new Set(
      (members || [])
          .map((member) => parseInt(member.user_id))
          .filter((id) => !isNaN(id)),
  );

  return [...(users || [])].sort((a, b) => {
    const aId = parseInt(a.user_id);
    const bId = parseInt(b.user_id);
    const aIsMember = memberIdSet.has(aId);
    const bIsMember = memberIdSet.has(bId);

    if (aIsMember !== bIsMember) {
      return aIsMember ? -1 : 1;
    }

    return compareUsersByNameThenEmail(a, b);
  });
};

const getSessionUserId = (request) => {
  const sessionEmail = (request.session.email || '').trim();
  if (!sessionEmail) return Promise.resolve(null);
  return User.fetchOne(sessionEmail)
      .then(([rows]) => {
        if (!rows || rows.length === 0) return null;
        return rows[0].user_id;
      })
      .catch(() => null);
};

const getCurrentUserTeams = (request) => {
  return getSessionUserId(request)
      .then((sessionUserId) => {
        if (!sessionUserId) return [];
        return Team.getTeamsByUser(sessionUserId)
            .then(([rows]) => (rows || []).map((row) => ({
              id: row.team_id,
              name: row.team_name,
            })));
      })
      .catch(() => []);
};

const redirectTeamsPermissionDenied = (response) => {
  return response.redirect('/teams/list?permissionDenied=1');
};

const canAccessTeam = (request, teamId) => {
  const normalizedRole = normalizeRole(request.session.role);
  if (normalizedRole === ROLES.ADMIN) {
    return Promise.resolve(true);
  }

  const normalizedTeamId = Number(teamId);
  if (!normalizedTeamId) {
    return Promise.resolve(false);
  }

  return getCurrentUserTeams(request)
      .then((teams) => {
        const currentUserTeamIds = new Set(
            (teams || [])
                .map((team) => Number(team.id))
                .filter((id) => !isNaN(id) && id > 0),
        );
        return currentUserTeamIds.has(normalizedTeamId);
      })
      .catch(() => false);
};

const withTeamAccess = (request, response, teamId, onAllowed) => {
  return canAccessTeam(request, teamId)
      .then((hasAccess) => {
        if (!hasAccess) {
          return redirectTeamsPermissionDenied(response);
        }

        return onAllowed();
      });
};

exports.getReport = (request, response, next) => {
  const teamId = request.params.teamId;
  const reportId = Number(request.query.reportId) || 0;

  return withTeamAccess(request, response, teamId, () => {
    return Promise.all([Team.getTeamWithMembers(teamId), getCurrentUserTeams(request)])
        .then(([[rows], userTeams]) => {
          if (!rows || rows.length === 0) {
            return response.status(404).redirect('/teams/list');
          }

          const team = {
            team_id: rows[0].team_id,
            team_name: rows[0].team_name,
            members: rows
                .filter((r) => r.user_id !== null)
                .map((r) => ({
                  user_id: r.user_id,
                  full_name: r.full_name,
                  email: r.email,
                })),
          };

          const selectedTeamId = String(team.team_id);

          if (!reportId) {
            return response.render('teamReport', {
              csrfToken: request.csrfToken(),
              email: request.session.email || '',
              role: request.session.role || '',
              team,
              userTeams,
              selectedTeamId,
              report: null,
              error: null,
              startDate: '',
              endDate: '',
              reportType: '',
            });
          }

          return Reports.findTeamReportById(reportId, teamId)
              .then(([reportRows]) => {
                if (!reportRows || reportRows.length === 0) {
                  return response.render('teamReport', {
                    csrfToken: request.csrfToken(),
                    email: request.session.email || '',
                    role: request.session.role || '',
                    team,
                    report: null,
                    error: 'Saved report not found for this team.',
                    startDate: '',
                    endDate: '',
                    reportType: '',
                  });
                }

                const saved = reportRows[0];
                return response.render('teamReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  role: request.session.role || '',
                  team,
                  userTeams,
                  selectedTeamId,
                  report: saved.ai_content,
                  error: null,
                  startDate: formatDateForInput(saved.date_beginning),
                  endDate: formatDateForInput(saved.date_end),
                  reportType: '',
                });
              });
        });
  })
      .catch((error) => {
        console.error(
            '[GET /teams/report] Failed to fetch team:',
            error.message,
        );
        next(error);
      });
};

exports.postReport = (request, response, next) => {
  const teamId = request.params.teamId;
  const {report_type, start_date, end_date} = request.body;

  return withTeamAccess(request, response, teamId, () => {
    return Promise.all([Team.getTeamWithMembers(teamId), getCurrentUserTeams(request)])
        .then(([[rows], userTeams]) => {
          if (!rows || rows.length === 0) {
            return response.status(404).redirect('/teams/list');
          }

          const team = {
            team_id: rows[0].team_id,
            team_name: rows[0].team_name,
            members: rows
                .filter((r) => r.user_id !== null)
                .map((r) => ({
                  user_id: r.user_id,
                  full_name: r.full_name,
                  email: r.email,
                })),
          };

          const selectedTeamId = String(team.team_id);

          const renderError = (msg) => {
            return response.status(400).render('teamReport', {
              csrfToken: request.csrfToken(),
              email: request.session.email || '',
              role: request.session.role || '',
              team,
              userTeams,
              selectedTeamId,
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
              return renderError(
                  'Invalid date format. Please use valid dates.',
              );
            }
            if (startDate > endDate) {
              return renderError('Start date cannot be after end date.');
            }
          } else {
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
              parsed.push({
                year: parseInt(match[1]),
                quarter: parseInt(match[2]),
              });
            }

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

          return Team.getTeamStandupsByDateRange(teamId, startStr, endStr)
              .then(([standups]) => {
                if (!standups || standups.length === 0) {
                  return renderError(
                      'No daily standups found for ' +
                    team.team_name +
                    ' between ' + startStr + ' and ' + endStr +
                    '. A report cannot be generated without standup data.',
                  );
                }

                return Reports.findTeamReportByRange(
                    teamId, startStr, endStr,
                )
                    .then(([existing]) => {
                      if (existing && existing.length > 0) {
                        return response.redirect(
                            '/teams/report/' + teamId +
                          '?reportId=' + existing[0].report_id,
                        );
                      }

                      return generateTeamReport(
                          team,
                          startDate,
                          endDate,
                          standups,
                      )
                          .then((reportText) => {
                            const standupIds = standups.map(
                                (r) => r.standup_id,
                            );
                            return getSessionUserId(request)
                                .then((sessionUserId) => {
                                  return Reports.createTeamReport({
                                    generatedByUserId: sessionUserId,
                                    teamId,
                                    startDate: startStr,
                                    endDate: endStr,
                                    aiContent: reportText,
                                    standupIds,
                                  });
                                })
                                .then((created) => {
                                  return response.redirect(
                                      '/teams/report/' + teamId +
                                    '?reportId=' + created.report_id,
                                  );
                                });
                          });
                    });
              })
              .catch((aiError) => {
                console.error(
                    '[POST /teams/report] AI generation failed:',
                    aiError.message,
                );
                return response.render('teamReport', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  role: request.session.role || '',
                  team,
                  userTeams,
                  selectedTeamId,
                  report: null,
                  error: 'Failed to generate AI report: ' +
                  (aiError.message || 'Unknown error'),
                  startDate: start_date || '',
                  endDate: end_date || '',
                  reportType: report_type,
                });
              });
        });
  })
      .catch((error) => {
        console.error(
            '[POST /teams/report] Failed to fetch team:',
            error.message,
        );
        next(error);
      });
};

exports.getEdit = (request, response, next) => {
  const teamId = request.params.teamId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  return withTeamAccess(request, response, teamId, () => {
    return Team.getTeamsDetails(teamId)
        .then((result) => {
        // New stored procedure returns multiple rows (one per member, or one row with NULLs if no members)
        // The structure is nested: result[0][0] contains the actual rows array
          let rows = [];

          if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
            rows = result[0][0];
          } else if (Array.isArray(result) && Array.isArray(result[0])) {
            rows = result[0];
          }


          if (!rows || rows.length === 0) {
            request.session.error = 'Team not found.';
            return response.redirect('/teams/list');
          }

          // Get team name from first row (all rows have the same team_name)
          const firstRow = rows[0];
          const teamName = firstRow.team_name ? String(firstRow.team_name).trim() : '';


          // Filter rows where user_id is NOT null to get only actual members
          // If a team has 0 members, there will be 1 row with user_id=null
          const members = rows
              .filter((row) => row.user_id !== null && row.user_id !== undefined)
              .map((row) => {
                const memberObj = {
                  user_id: parseInt(row.user_id),
                  full_name: row.full_name,
                  email: row.email,
                  slack_handle: row.slack_handle,
                };
                return memberObj;
              });

          const sortedMembers = [...members].sort(compareUsersByNameThenEmail);

          // Get all available users to allow adding new members
          return User.getAll().then(([allUsers]) => {
            const allUsersSorted = sortUsersWithTeamMembersFirst(allUsers, sortedMembers);
            const viewData = {
              csrfToken: request.csrfToken(),
              error: error,
              email: request.session.email || '',
              teamId: teamId,
              teamName: teamName,
              members: sortedMembers,
              allUsers: allUsersSorted,
            };


            response.render('teamEdit', viewData);
          });
        });
  })
      .catch((error) => {
        console.error('[GET /teams/edit] Failed to fetch team details:', error);
        request.session.error = 'Could not load team details. Please try again.';
        return response.redirect('/teams/list');
      });
};

exports.postEdit = (request, response, next) => {
  const teamId = request.params.teamId;
  const {userIds, teamName} = request.body;

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  // Validate team name
  if (!teamName || teamName.trim() === '') {
    request.session.error = 'Team name is required.';
    return response.redirect(`/teams/edit/${teamId}`);
  }

  if (teamName.trim().length > 100) {
    request.session.error = 'Team name cannot exceed 100 characters.';
    return response.redirect(`/teams/edit/${teamId}`);
  }

  const newTeamName = teamName.trim();
  const userIdString = userIds || '';

  // First, check if the new team name already exists (and is different from current name)
  return withTeamAccess(request, response, teamId, () => {
    return Team.getTeamsDetails(teamId)
        .then((result) => {
          let rows = [];
          if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
            rows = result[0][0];
          } else if (Array.isArray(result) && Array.isArray(result[0])) {
            rows = result[0];
          }

          if (!rows || rows.length === 0) {
            request.session.error = 'Team not found.';
            return response.redirect('/teams/list');
          }

          const currentTeamName = String(rows[0].team_name).trim();

          // Only check for duplicate name if the name has changed
          if (newTeamName !== currentTeamName) {
            return Team.findByName(newTeamName)
                .then(([existingTeams]) => {
                  if (existingTeams.length > 0) {
                    request.session.error = 'Duplicate team names are not allowed';
                    response.redirect(`/teams/edit/${teamId}`);
                    return Promise.reject(new Error('DUPLICATE_NAME'));
                  }
                });
          }
        })
        .then(() => {
        // Validate that all user IDs exist in the database
          return User.getAll()
              .then(([allUsers]) => {
                const validUserIds = allUsers.map((u) => u.user_id);

                // Parse the userIds string and validate each one
                let requestedUserIds = [];
                if (userIdString && userIdString.trim() !== '') {
                  requestedUserIds = userIdString.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
                }

                // Check if any requested user IDs don't exist
                const invalidUserIds = requestedUserIds.filter((id) => !validUserIds.includes(id));
                if (invalidUserIds.length > 0) {
                  console.error(`[POST /teams/edit] Invalid user IDs detected:`, invalidUserIds);
                  request.session.error = 'Some selected users are no longer available. Please refresh and try again.';
                  return response.redirect(`/teams/edit/${teamId}`);
                }

                return Team.updateTeamName(teamId, newTeamName)
                    .then(() => Team.updateTeamMembers(teamId, userIdString));
              });
        })
        .then(() => {
          request.session.success = 'Team updated successfully!';
          return response.redirect('/teams/list');
        })
        .catch((error) => {
          if (error.message === 'DUPLICATE_NAME') return;
          console.error('[POST /teams/edit] Failed to update team members:', error.sqlMessage || error.message);
          request.session.error = 'Could not update team members. Please try again.';
          return response.redirect(`/teams/edit/${teamId}`);
        });
  });
};

exports.getAdd = (request, response, next) => {
  const error = request.session.error || '';
  request.session.error = '';

  User.getAll()
      .then(([rows, fieldData]) => {
        response.render('teamAdd', {
          csrfToken: request.csrfToken(),
          error: error,
          email: request.session.email || '',
          users: rows,
        });
      })
      .catch((error) => {
        console.error('[GET /teams/add] Failed to fetch users:', error.message);
        response.render('teamAdd', {
          csrfToken: request.csrfToken(),
          error: 'Error loading users.',
          email: request.session.email || '',
          users: [],
        });
      });
};

exports.postAdd = (request, response, next) => {
  const {teamName, members, leads} = request.body;

  if (!teamName || teamName.trim() === '') {
    return User.getAll()
        .then(([userRows]) => {
          response.status(400).render('teamAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Team name is required.',
            users: userRows,
          });
        })
        .catch(() => {
          response.status(400).render('teamAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Team name is required.',
            users: [],
          });
        });
  }

  if (teamName.trim().length > 100) {
    return User.getAll()
        .then(([userRows]) => {
          response.status(400).render('teamAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Team name cannot exceed 100 characters.',
            users: userRows,
          });
        })
        .catch(() => {
          response.status(400).render('teamAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Team name cannot exceed 100 characters.',
            users: [],
          });
        });
  }

  // Check if team name already exists
  Team.findByName(teamName)
      .then(([rows]) => {
        if (rows.length > 0) {
          return User.getAll()
              .then(([userRows]) => {
                response.status(400).render('teamAdd', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  error: `A team with the name "${teamName.trim()}" already exists.`,
                  users: userRows,
                });
              })
              .catch(() => {
                response.status(400).render('teamAdd', {
                  csrfToken: request.csrfToken(),
                  email: request.session.email || '',
                  error: `A team with the name "${teamName.trim()}" already exists.`,
                  users: [],
                });
              });
        }

        // Team name doesn't exist, proceed with creation
        const team = new Team(teamName.trim());

        return team.save()
            .then(([result]) => {
              const teamId = result.insertId;

              // Ensure members is an array (it comes as array from hidden inputs)
              const memberArray = Array.isArray(members) ? members : (members ? [members] : []);

              if (memberArray.length === 0) {
                console.log(`[POST /teams/add] No members added to team ${teamId}`);
                request.session.success = 'Team created successfully!';
                return response.redirect(`/teams/details/${teamId}`);
              }

              return Team.addMembersToTeam(teamId, memberArray)
                  .then(() => {
                    console.log(`[POST /teams/add] Successfully added ${memberArray.length} members to team ${teamId}`);
                    request.session.success = 'Team created successfully!';
                    return response.redirect(`/teams/details/${teamId}`);
                  })
                  .catch((error) => {
                    console.error('[POST /teams/add] Failed to add members:', error.sqlMessage || error.message);
                    throw error;
                  });
            })
            .catch((error) => {
              console.error('[POST /teams/add] Failed to save team:', error.sqlMessage || error.message);
              return User.getAll()
                  .then(([rows]) => {
                    response.status(400).render('teamAdd', {
                      csrfToken: request.csrfToken(),
                      email: request.session.email || '',
                      error: 'Could not create the team. Please try again.',
                      users: rows,
                    });
                  })
                  .catch(() => {
                    response.status(400).render('teamAdd', {
                      csrfToken: request.csrfToken(),
                      email: request.session.email || '',
                      error: 'Could not create the team. Please try again.',
                      users: [],
                    });
                  });
            });
      })
      .catch((error) => {
        console.error('[POST /teams/add] Failed to check team name:', error.message);
        User.getAll()
            .then(([rows]) => {
              response.status(400).render('teamAdd', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                error: 'Could not verify team name. Please try again.',
                users: rows,
              });
            })
            .catch(() => {
              response.status(400).render('teamAdd', {
                csrfToken: request.csrfToken(),
                email: request.session.email || '',
                error: 'Error creating team. Please try again.',
                users: [],
              });
            });
      });
};

exports.postDelete = (request, response, next) => {
  const teamId = request.params.id;

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  return withTeamAccess(request, response, teamId, () => {
    return Team.delete(teamId)
        .then(() => {
          request.session.success = 'Team deleted successfully!';
          return response.redirect('/teams/list');
        })
        .catch((error) => {
          console.error('[POST /teams/delete] Failed to delete team:', error.sqlMessage || error.message);
          request.session.error = 'Could not delete the team. It may be linked to active projects.';
          return response.redirect('/teams/list');
        });
  });
};

exports.getDetails = (request, response, next) => {
  const teamId = request.params.teamId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  return withTeamAccess(request, response, teamId, () => {
    return Team.getTeamsDetails(teamId)
        .then((result) => {
          let rows = [];
          if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
            rows = result[0][0];
          } else if (Array.isArray(result) && Array.isArray(result[0])) {
            rows = result[0];
          }

          if (!rows || rows.length === 0) {
            request.session.error = 'Team not found.';
            return response.redirect('/teams/list');
          }

          const firstRow = rows[0];
          const teamName = firstRow.team_name ? String(firstRow.team_name).trim() : '';

          const members = rows
              .filter((row) => row.user_id !== null && row.user_id !== undefined)
              .map((row) => ({
                user_id: parseInt(row.user_id),
                full_name: row.full_name,
                email: row.email,
                slack_handle: row.slack_handle,
              }))
              .sort(compareUsersByNameThenEmail);

        return Team.selectLast3reports(teamId)
            .then(([reportRows]) => {
              const viewData = {
                csrfToken: request.csrfToken(),
                error: error,
                email: request.session.email || '',
                teamId: teamId,
                teamName: teamName,
                members: members,
                reports: reportRows || [],
              };

              response.render('teamDetails', viewData);
            });
      })
      .catch((error) => {
        console.error('[GET /teams/details] Failed to fetch team details:', error);
        request.session.error = 'Could not load team details. Please try again.';
        return response.redirect('/teams/list');
      });
};
