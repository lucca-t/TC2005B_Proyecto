const Team = require('../models/teams.model');
const User = require('../models/users.model');
const bcrypt = require('bcrypt');

exports.get_list = (request, response, next) => {
    const error = request.session.error || '';
<<<<<<< HEAD
    request.session.error = '';
=======
    const success = request.session.success || '';
    request.session.error = '';
    request.session.success = '';
>>>>>>> cesar/ind
    
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
<<<<<<< HEAD
                error: error, 
=======
                error: error,
                success: success, 
>>>>>>> cesar/ind
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
<<<<<<< HEAD
=======
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
>>>>>>> cesar/ind
};