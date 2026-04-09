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

// Modify to allow get edit of a specific team
exports.get_edit = (request, response, next) => {
  const teamId = request.params.teamId;
  const error = request.session.error || '';
  request.session.error = '';

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  console.log(`[GET /teams/edit] Loading team ${teamId}`);

  Team.getTeamsDetails(teamId)
      .then((result) => {
        console.log(`[GET /teams/edit] Query result structure:`, result);

        // New stored procedure returns multiple rows (one per member, or one row with NULLs if no members)
        // The structure is nested: result[0][0] contains the actual rows array
        let rows = [];

        if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
          rows = result[0][0];
        } else if (Array.isArray(result) && Array.isArray(result[0])) {
          rows = result[0];
        }

        console.log(`[GET /teams/edit] Extracted rows:`, rows);

        if (!rows || rows.length === 0) {
          console.log(`[GET /teams/edit] No data found for team ${teamId}`);
          request.session.error = 'Team not found.';
          return response.redirect('/teams/list');
        }

        // Get team name from first row (all rows have the same team_name)
        const firstRow = rows[0];
        const teamName = firstRow.team_name ? String(firstRow.team_name).trim() : '';

        console.log(`[GET /teams/edit] First row object:`, firstRow);
        console.log(`[GET /teams/edit] Team Name extracted: "${teamName}"`);

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
              console.log(`[GET /teams/edit] Mapped member:`, memberObj);
              return memberObj;
            });

        console.log(`[GET /teams/edit] Final Members array:`, members);
        console.log(`[GET /teams/edit] Members count: ${members.length}`);

        // Get all available users to allow adding new members
        return User.getAll().then(([allUsers]) => {
          console.log(`[GET /teams/edit] All users count: ${allUsers.length}`);
          console.log(`[GET /teams/edit] All users sample:`, allUsers.slice(0, 2));

          const viewData = {
            csrfToken: request.csrfToken(),
            error: error,
            email: request.session.email || '',
            teamId: teamId,
            teamName: teamName,
            members: members,
            allUsers: allUsers,
          };

          console.log(`[GET /teams/edit] ========== RENDERING VIEW WITH DATA =========`);
          console.log(`[GET /teams/edit] teamName: "${viewData.teamName}"`);
          console.log(`[GET /teams/edit] teamId: ${viewData.teamId}`);
          console.log(`[GET /teams/edit] members array:`, viewData.members);
          console.log(`[GET /teams/edit] members IDs:`, viewData.members.map((m) => m.user_id));
          console.log(`[GET /teams/edit] allUsers IDs:`, viewData.allUsers.map((u) => u.user_id));
          console.log(`[GET /teams/edit] =========================================`);

          response.render('teamEdit', viewData);
        });
      })
      .catch((error) => {
        console.error('[GET /teams/edit] Failed to fetch team details:', error);
        console.error('[GET /teams/edit] Error message:', error.message);
        console.error('[GET /teams/edit] Error code:', error.code);
        request.session.error = 'Error loading team details: ' + (error.message || 'Unknown error');
        return response.redirect('/teams/list');
      });
};

exports.post_edit = (request, response, next) => {
  const teamId = request.params.teamId;
  const {userIds} = request.body;

  if (!teamId) {
    request.session.error = 'Team ID is required.';
    return response.redirect('/teams/list');
  }

  // userIds is a comma-separated string from the form (e.g., "1,2,5" or empty string "")
  const userIdString = userIds || '';

  console.log(`[POST /teams/edit/:${teamId}] Received userIds:`, userIdString);

  // First, validate that all user IDs exist in the database
  User.getAll()
      .then(([allUsers]) => {
        const validUserIds = allUsers.map((u) => u.user_id);

        // Parse the userIds string and validate each one
        let requestedUserIds = [];
        if (userIdString && userIdString.trim() !== '') {
          requestedUserIds = userIdString.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
        }

        console.log(`[POST /teams/edit] Valid user IDs in database:`, validUserIds);
        console.log(`[POST /teams/edit] Requested user IDs:`, requestedUserIds);

        // Check if any requested user IDs don't exist
        const invalidUserIds = requestedUserIds.filter((id) => !validUserIds.includes(id));
        if (invalidUserIds.length > 0) {
          console.error(`[POST /teams/edit] Invalid user IDs detected:`, invalidUserIds);
          request.session.error = `Error: Invalid user IDs - ${invalidUserIds.join(', ')} do not exist.`;
          return response.redirect(`/teams/edit/${teamId}`);
        }

        console.log(`[POST /teams/edit] All user IDs are valid. Updating team members`);

        return Team.updateTeamMembers(teamId, userIdString);
      })
      .then(() => {
        console.log(`[POST /teams/edit] Team ${teamId} members updated successfully`);
        request.session.success = 'Team members updated successfully!';
        return response.redirect('/teams/list');
      })
      .catch((error) => {
        console.error('[POST /teams/edit] Failed to update team members:', error.sqlMessage || error.message);
        console.error('[POST /teams/edit] Full error:', error);
        request.session.error = 'Error updating team members: ' + (error.sqlMessage || error.message || 'Unknown error');
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

  console.log('[POST /teams/add] Form data received:', {teamName, members, leads});
  console.log('[POST /teams/add] Full body:', request.body);

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
          console.log('[POST /teams/add] Team name already exists:', teamName);
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

              console.log(`[POST /teams/add] Created team ${teamId} with members:`, memberArray);

              if (memberArray.length === 0) {
                console.log(`[POST /teams/add] No members added to team ${teamId}`);
                return response.redirect('/teams/list');
              }

              return Team.addMembersToTeam(teamId, memberArray)
                  .then(() => {
                    console.log(`[POST /teams/add] Successfully added ${memberArray.length} members to team ${teamId}`);
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
        console.log(`[POST /teams/delete] Team ${teamId} deleted successfully`);
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

  console.log(`[GET /teams/details] Loading team ${teamId}`);

  Team.getTeamsDetails(teamId)
      .then((result) => {
        console.log(`[GET /teams/details] Query result structure:`, result);

        // New stored procedure returns multiple rows (one per member, or one row with NULLs if no members)
        // The structure is nested: result[0][0] contains the actual rows array
        let rows = [];

        if (Array.isArray(result) && Array.isArray(result[0]) && Array.isArray(result[0][0])) {
          rows = result[0][0];
        } else if (Array.isArray(result) && Array.isArray(result[0])) {
          rows = result[0];
        }

        console.log(`[GET /teams/details] Extracted rows:`, rows);

        if (!rows || rows.length === 0) {
          console.log(`[GET /teams/edit] No data found for team ${teamId}`);
          request.session.error = 'Team not found.';
          return response.redirect('/teams/list');
        }

        // Get team name from first row (all rows have the same team_name)
        const firstRow = rows[0];
        const teamName = firstRow.team_name ? String(firstRow.team_name).trim() : '';

        console.log(`[GET /teams/details] First row object:`, firstRow);
        console.log(`[GET /teams/details] Team Name extracted: "${teamName}"`);

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
              console.log(`[GET /teams/details] Mapped member:`, memberObj);
              return memberObj;
            });

        console.log(`[GET /teams/details] Final Members array:`, members);
        console.log(`[GET /teams/details] Members count: ${members.length}`);

        // Get all available users to allow adding new members
        return User.getAll().then(([allUsers]) => {
          console.log(`[GET /teams/details] All users count: ${allUsers.length}`);
          console.log(`[GET /teams/details] All users sample:`, allUsers.slice(0, 2));

          const viewData = {
            csrfToken: request.csrfToken(),
            error: error,
            email: request.session.email || '',
            teamId: teamId,
            teamName: teamName,
            members: members,
            allUsers: allUsers,
          };

          console.log(`[GET /teams/details] ========== RENDERING VIEW WITH DATA =========`);
          console.log(`[GET /teams/details] teamName: "${viewData.teamName}"`);
          console.log(`[GET /teams/details] teamId: ${viewData.teamId}`);
          console.log(`[GET /teams/details] members array:`, viewData.members);
          console.log(`[GET /teams/details] members IDs:`, viewData.members.map((m) => m.user_id));
          console.log(`[GET /teams/details] allUsers IDs:`, viewData.allUsers.map((u) => u.user_id));
          console.log(`[GET /teams/details] =========================================`);

          response.render('teamDetails', viewData);
        });
      })
      .catch((error) => {
        console.error('[GET /teams/details] Failed to fetch team details:', error);
        console.error('[GET /teams/details] Error message:', error.message);
        console.error('[GET /teams/details] Error code:', error.code);
        request.session.error = 'Error loading team details: ' + (error.message || 'Unknown error');
        return response.redirect('/teams/list');
      });
};