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
    const error = request.session.error || '';
    request.session.error = '';
    response.render('teamEdit', {
        csrfToken: request.csrfToken(),
        error: error,
        email: request.session.email || '',
    });
};

exports.post_edit = (request, response, next) => {
    const teamId = request.params.teamId;
    const { teamName, members } = request.body;

    if (!teamName || teamName.trim() === '') {
        request.session.error = 'Team name is required.';
        return response.redirect(`/teams/edit/${teamId}`);
    }

    const memberList = Array.isArray(members) ? members.join(',') : (members || '');

    Team.updateTeamMembers(teamId, memberList)
        .then(() => {
            request.session.success = 'Team updated successfully!';
            return response.redirect('/teams/list');
        })
        .catch((error) => {
            console.error('[POST /teams/edit] Failed to update team:', error.sqlMessage || error.message);
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
                        users:  rows,
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