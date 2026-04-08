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
            const teams = rows.map(row => ({
                id: row.team_id,
                name: row.team_name,
                startDate: row.team_start_date,
                memberCount: row.memberCount || 0
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

//Modify to allow get edit of a specific team
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
            
            // Handle stored procedure result - it returns [[rows], fields]
            // For stored procedures, the actual data is in result[0]
            const rows = Array.isArray(result) ? result[0] : result;
            
            console.log(`[GET /teams/edit] Extracted rows:`, rows);

            if (!rows || rows.length === 0) {
                console.log(`[GET /teams/edit] No data found for team ${teamId}`);
                request.session.error = 'Team not found.';
                return response.redirect('/teams/list');
            }

            // Group team data: first row contains team_id and team_name, remaining rows are members
            const teamName = rows[0] && rows[0].team_name ? String(rows[0].team_name).trim() : '';
            console.log(`[GET /teams/edit] Team Name: "${teamName}"`);
            
            // Normalize member user IDs to strings for consistent comparison
            const members = rows.filter(row => row.user_id !== null).map(row => ({
                user_id: String(row.user_id),
                full_name: row.full_name,
                email: row.email,
                slack_handle: row.slack_handle,
                member_since: row.member_since
            }));

            console.log(`[GET /teams/edit] Members:`, members);
            console.log(`[GET /teams/edit] Members count: ${members.length}`);

            // Get all available users to allow adding new members
            return User.getAll().then(([allUsers]) => {
                console.log(`[GET /teams/edit] All users count: ${allUsers.length}`);
                console.log(`[GET /teams/edit] All users sample:`, allUsers.slice(0, 2));
                
                response.render('teamEdit', {
                    csrfToken: request.csrfToken(),
                    error: error,
                    email: request.session.email || '',
                    teamId: teamId,
                    teamName: teamName,
                    members: members,
                    allUsers: allUsers
                });
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
    const { userIds } = request.body;

    if (!teamId) {
        request.session.error = 'Team ID is required.';
        return response.redirect('/teams/list');
    }

    // userIds should be a comma-separated string of user IDs
    // If no users are selected, pass an empty string
    const userIdString = userIds || '';

    console.log(`[POST /teams/edit/:${teamId}] Updating team members:`, userIdString);

    Team.updateTeamMembers(teamId, userIdString)
        .then(() => {
            console.log(`[POST /teams/edit] Team ${teamId} members updated successfully`);
            request.session.success = 'Team members updated successfully!';
            return response.redirect('/teams/list');
        })
        .catch((error) => {
            console.error('[POST /teams/edit] Failed to update team members:', error.sqlMessage || error.message);
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
    const { teamName, members, leads } = request.body;

    console.log('[POST /teams/add] Form data received:', { teamName, members, leads });
    console.log('[POST /teams/add] Full body:', request.body);

    if (!teamName || teamName.trim() === '') {
        return response.status(400).render('teamAdd', {
            csrfToken: request.csrfToken(),
            email: request.session.email || '',
            error: 'Team name is required.',
            users: [],
        });
    }

    const team = new Team(teamName.trim());

    team.save()
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
            User.getAll()
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