const Team = require('../models/teams.model');
const User = require('../models/users.model');
const bcrypt = require('bcrypt');

exports.get_list = (request, response, next) => {
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  Team.getAllWithMemberCount()
      .then(([rows, fieldData]) => {
        const teams = rows.map((row) => ({
          id: row.team_id,
          name: row.team_name,
          startDate: row.team_start_date,
          memberCount: row.memberCount || 0,
        }));

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
          email: request.session.email || '',
          teams: [],
        });
      });
};

exports.get_edit = (request, response, next) => {
  const teamId = request.params.teamId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  Team.getTeamsDetails(teamId)
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

        // Get all available users to allow adding new members
        return User.getAll().then(([allUsers]) => {

          const viewData = {
            csrfToken: request.csrfToken(),
            error: error,
            email: request.session.email || '',
            teamId: teamId,
            teamName: teamName,
            members: members,
            allUsers: allUsers,
          };


          response.render('teamEdit', viewData);
        });
      })
      .catch((error) => {
        request.session.error = 'Error loading team details: ' + (error.message || 'Unknown error');
        return response.redirect('/teams/list');
      });
};

exports.post_edit = (request, response, next) => {
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

  const newTeamName = teamName.trim();
  const userIdString = userIds || '';

  // First, check if the new team name already exists (and is different from current name)
  Team.getTeamsDetails(teamId)
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
                request.session.error = `Error: Invalid user IDs - ${invalidUserIds.join(', ')} do not exist.`;
                response.redirect(`/teams/edit/${teamId}`);
                return Promise.reject(new Error('INVALID_USER_IDS'));
              }

              // Update both team name and members
              return Promise.all([
                Team.updateTeamName(teamId, newTeamName),
                Team.updateTeamMembers(teamId, userIdString),
              ]);
            });
      })
      .then(() => {
        request.session.success = 'Team updated successfully!';
        return response.redirect('/teams/list');
      })
      .catch((error) => {
        // Don't log error if it's our custom rejection
        if (error.message === 'DUPLICATE_NAME' || error.message === 'INVALID_USER_IDS') {
          return; // Error already handled and redirect already sent
        }
        request.session.error = 'Error updating team: ' + (error.sqlMessage || error.message || 'Unknown error');
        return response.redirect(`/teams/edit/${teamId}`);
      });
};

exports.get_add = (request, response, next) => {
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

exports.post_add = (request, response, next) => {
  const {teamName, members, leads} = request.body;

  if (!teamName || teamName.trim() === '') {
    return response.status(400).render('teamAdd', {
      csrfToken: request.csrfToken(),
      email: request.session.email || '',
      error: 'Team name is required.',
      users: [],
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
                return response.redirect('/teams/list');
              }

              return Team.addMembersToTeam(teamId, memberArray)
                  .then(() => {
                    return response.redirect('/teams/list');
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
                      error: 'Error creating team: ' + (error.sqlMessage || error.message || 'Unknown error'),
                      users: rows,
                    });
                  })
                  .catch(() => {
                    response.status(400).render('teamAdd', {
                      csrfToken: request.csrfToken(),
                      email: request.session.email || '',
                      error: 'Error creating team: ' + (error.sqlMessage || error.message || 'Unknown error'),
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
                error: 'Error verifying team name: ' + (error.message || 'Unknown error'),
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

exports.post_delete = (request, response, next) => {
  const teamId = request.params.id;

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  Team.delete(teamId)
      .then(() => {
        request.session.success = 'Team deleted successfully!';
        return response.redirect('/teams/list');
      })
      .catch((error) => {
        console.error('[POST /teams/delete] Failed to delete team:', error.sqlMessage || error.message);
        request.session.error = 'Error deleting team: ' + (error.sqlMessage || error.message || 'Unknown error');
        return response.redirect('/teams/list');
      });
};

exports.get_details = (request, response, next) => {
  const teamId = request.params.teamId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  Promise.all([
    Team.getTeamsDetails(teamId),
    Team.selectLast3reports(teamId),
  ])
      .then(([teamResult, reportsResult]) => {

        let rows = [];
        if (Array.isArray(teamResult) && Array.isArray(teamResult[0]) && Array.isArray(teamResult[0][0])) {
          rows = teamResult[0][0];
        } else if (Array.isArray(teamResult) && Array.isArray(teamResult[0])) {
          rows = teamResult[0];
        }

        let reports = [];
        if (Array.isArray(reportsResult) && Array.isArray(reportsResult[0])) {
          reports = reportsResult[0];
        } else if (Array.isArray(reportsResult)) {
          reports = reportsResult;
        }


        if (!rows || rows.length === 0) {
          request.session.error = 'Team not found.';
          return response.redirect('/teams/list');
        }

        const firstRow = rows[0];
        const teamName = firstRow.team_name ? String(firstRow.team_name).trim() : '';

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

        const viewData = {
          csrfToken: request.csrfToken(),
          error: error,
          email: request.session.email || '',
          teamId: teamId,
          teamName: teamName,
          members: members,
          reports: reports,
        };


        response.render('teamDetails', viewData);
      })
      .catch((error) => {
        console.error('[GET /teams/details] Failed to fetch team details:', error);
        console.error('[GET /teams/details] Error message:', error.message);
        console.error('[GET /teams/details] Error code:', error.code);
        request.session.error = 'Error loading team details: ' + (error.message || 'Unknown error');
        return response.redirect('/teams/list');
      });
};