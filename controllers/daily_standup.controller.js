const {response} = require('express');
const Team = require('../models/teams.model');
const User = require('../models/users.model');
const Standup = require('../models/standup.model');

const getCurrentUserId = async (request) => {
  const email = (request.session.email || '').trim();

  if (!email) {
    return null;
  }

  const [rows] = await User.fetchOne(email);
  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0].user_id;
};

const normalizeDateFilter = (value) => {
  const normalized = (value || '').trim();

  if (!normalized) {
    return '';
  }

  const parsed = new Date(normalized + 'T00:00:00');
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return normalized;
};

const buildTeamHistoryViewModel = async (request) => {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    return {
      redirectToLogin: true,
    };
  }

  const [teamsRows] = await Team.getTeamsByUser(userId);
  const teams = (teamsRows || []).map((row) => ({
    id: row.team_id,
    name: row.team_name,
  }));

  if (teams.length === 0) {
    return {
      teams: [],
      selectedTeamId: '',
      team: {
        team_id: '',
        team_name: '',
        members: [],
      },
      standups: [],
      error: 'No active team was found for your account.',
    };
  }

  const requestedTeamId = (request.query.team_id || '').trim();
  const selectedTeam = teams.find((team) => String(team.id) === requestedTeamId) || teams[0];
  const selectedTeamId = String(selectedTeam.id);

  const [teamRows] = await Team.getTeamWithMembers(selectedTeamId);
  const team = {
    team_id: selectedTeamId,
    team_name: teamRows && teamRows.length > 0 ? teamRows[0].team_name : selectedTeam.name,
    members: (teamRows || [])
        .filter((row) => row.user_id !== null)
        .map((row) => ({
          user_id: row.user_id,
          full_name: row.full_name,
          email: row.email,
        })),
  };

  const memberIds = new Set(team.members.map((member) => String(member.user_id)));
  const selectedUserId = (request.query.user_id || '').trim();
  const selectedDate = normalizeDateFilter(request.query.date);
  const filters = {
    userId: '',
    date: selectedDate,
  };
  let error = '';

  if (selectedUserId) {
    if (!memberIds.has(selectedUserId)) {
      error = 'The selected user does not belong to this team.';
    } else {
      filters.userId = selectedUserId;
    }
  }

  const standups = error ? [] : await Standup.getTeamHistory(selectedTeamId, filters)
      .then(([rows]) => rows || []);

  return {
    teams,
    selectedTeamId,
    team,
    standups,
    filters: {
      userId: filters.userId,
      date: selectedDate,
    },
    error,
  };
};

const buildTeamHistoryJsonResponse = (viewModel) => {
  return {
    ok: !viewModel.error,
    team: viewModel.team,
    selectedTeamId: viewModel.selectedTeamId,
    standups: viewModel.standups,
    filters: viewModel.filters || {userId: '', date: ''},
    error: viewModel.error || '',
  };
};

const isValidDateInput = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
};

exports.get_standup_duplicate_validation = async (request, response, next) => {
  if (!request.session.email) {
    return response.status(401).json({
      ok: false,
      duplicate: false,
      error: 'Unauthorized',
    });
  }

  const selectedDate = (request.query.date || '').trim();
  if (!isValidDateInput(selectedDate)) {
    return response.status(400).json({
      ok: false,
      duplicate: false,
      error: 'Invalid date value',
    });
  }

  try {
    const [rows] = await Standup.getUserId(request.session.email);
    if (!rows || rows.length === 0) {
      return response.status(404).json({
        ok: false,
        duplicate: false,
        error: 'User not found',
      });
    }

    const userId = rows[0].user_id;
    const [existing] = await Standup.checkDuplicate(userId, selectedDate);

    return response.json({
      ok: true,
      duplicate: existing.length > 0,
      date: selectedDate,
    });
  } catch (err) {
    console.error('Error validating standup duplicate date:', err);
    return response.status(500).json({
      ok: false,
      duplicate: false,
      error: 'Server connection error. Please try again later.',
    });
  }
};

exports.get_standup_form = (request, response, next) => {
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  response.render('daily_standup', {
    csrfToken: request.csrfToken(),
    error: error,
    success: success,
    title: 'Register activity - Daily Standup+',
    email: request.session.email || '',
    showHistorialBtn: true,
    editMode: false,
    standup: null,
  });
};

exports.post_standup = (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  const {did_today, do_tomorrow, blockers} = request.body;

  if (!did_today || !did_today.trim() || !do_tomorrow || !do_tomorrow.trim()) {
    request.session.error = 'Please fill in the required fields: What did you do today? and What will you do tomorrow?';
    return response.redirect('/daily_standup');
  }

  const email = request.session.email;
  const selectedDate = request.body.date || new Date().toISOString().split('T')[0];

  Standup.getUserId(email)
      .then(([rows]) => {
        if (rows.length === 0) {
          request.session.error = 'User not found';
          return response.redirect('/daily_standup');
        }

        const user_id = rows[0].user_id;

        return Standup.checkDuplicate(user_id, selectedDate)
            .then(([existing]) => {
              if (existing.length > 0) {
                request.session.error = 'A standup report already exists for today';
                return response.redirect('/daily_standup');
              }

              const standup = new Standup(selectedDate, did_today.trim(), do_tomorrow.trim(), (blockers || '').trim(), user_id);
              return standup.save()
                  .then(() => {
                    request.session.success = 'Process completed. Your daily activity has been successfully registered';
                    return response.redirect('/daily_standup/history');
                  });
            });
      })
      .catch((err) => {
        console.error('Error saving standup:', err);
        request.session.error = 'An error occurred while saving your activity. Please try again';
        return response.redirect('/daily_standup');
      });
};

exports.get_standup_history = (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  const email = request.session.email;
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  Standup.getUserId(email)
      .then(([userRows]) => {
        const userId = userRows.length > 0 ? userRows[0].user_id : null;
        return Standup.getHistory(email)
            .then(([rows]) => {
              response.render('standup_history', {
                csrfToken: request.csrfToken(),
                title: 'Activity History - Daily Standup+',
                email: email,
                standups: rows,
                userId: userId,
                error: error,
                success: success,
              });
            });
      })
      .catch((err) => {
        console.error('Error fetching standup history:', err);
        response.render('standup_history', {
          csrfToken: request.csrfToken(),
          title: 'Activity History - Daily Standup+',
          email: email,
          standups: [],
          userId: null,
          error: error || 'Server connection error. Please try again later.',
          success: success,
        });
      });
};

exports.get_team_standup_history = async (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  try {
    const viewModel = await buildTeamHistoryViewModel(request);

    if (viewModel.redirectToLogin) {
      return response.redirect('/users/login');
    }

    return response.render('standup_team_history', {
      csrfToken: request.csrfToken(),
      title: 'Team Activity History - Daily Standup+',
      email: request.session.email || '',
      teams: viewModel.teams,
      selectedTeamId: viewModel.selectedTeamId,
      team: viewModel.team,
      standups: viewModel.standups,
      filters: viewModel.filters || {userId: '', date: ''},
      error: viewModel.error || '',
    });
  } catch (err) {
    console.error('Error fetching team standup history:', err);
    return response.render('standup_team_history', {
      csrfToken: request.csrfToken(),
      title: 'Team Activity History - Daily Standup+',
      email: request.session.email || '',
      teams: [],
      selectedTeamId: '',
      team: {
        team_id: '',
        team_name: '',
        members: [],
      },
      standups: [],
      filters: {userId: '', date: ''},
      error: 'Server connection error. Please try again later.',
    });
  }
};

exports.get_team_standup_history_data = async (request, response, next) => {
  if (!request.session.email) {
    return response.status(401).json({
      ok: false,
      error: 'Unauthorized',
      team: null,
      standups: [],
      filters: {userId: '', date: ''},
    });
  }

  try {
    const viewModel = await buildTeamHistoryViewModel(request);

    if (viewModel.redirectToLogin) {
      return response.status(401).json({
        ok: false,
        error: 'Unauthorized',
        team: null,
        standups: [],
        filters: {userId: '', date: ''},
      });
    }

    if (viewModel.error) {
      return response.status(400).json(buildTeamHistoryJsonResponse(viewModel));
    }

    return response.json(buildTeamHistoryJsonResponse(viewModel));
  } catch (err) {
    console.error('Error fetching team standup history data:', err);
    return response.status(500).json({
      ok: false,
      error: 'Server connection error. Please try again later.',
      team: null,
      standups: [],
      filters: {userId: '', date: ''},
    });
  }
};

exports.post_deleteRegister = (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  const standupId = request.params.id;

  Standup.deleteRegister(standupId)
      .then(() => {
        request.session.success = 'Record deleted successfully';
        return response.redirect('/daily_standup/history');
      })
      .catch((err) => {
        console.error('Error deleting standup:', err);
        request.session.error = 'Error deleting record. Please try again.';
        return response.redirect('/daily_standup/history');
      });
};

exports.get_standup_edit = (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  const standupId = request.params.id;
  const error = request.session.error || '';
  const success = request.session.success || '';
  request.session.error = '';
  request.session.success = '';

  Standup.findById(standupId).then(([rows]) => {
    if (rows.length === 0) {
      request.session.error = 'Record not found';
      return response.redirect('/daily_standup/history');
    }

    response.render('daily_standup', {
      csrfToken: request.csrfToken(),
      error: error,
      success: success,
      title: 'Edit activity - Daily Standup+',
      email: request.session.email || '',
      showHistorialBtn: true,
      editMode: true,
      standup: rows[0],
    });
  })
      .catch((err) => {
        console.error('Error fetching standup:', err);
        request.session.error = 'Error loading standup. Please try again.';
        return response.redirect('/daily_standup/history');
      });
};

exports.post_standup_edit = (request, response, next) => {
  if (!request.session.email) {
    return response.redirect('/users/login');
  }

  const standupId = request.params.id;
  const {did_today, do_tomorrow, blockers, date} = request.body;

  if (!did_today || !did_today.trim() || !do_tomorrow || !do_tomorrow.trim()) {
    request.session.error = 'Please fill in the required fields.';
    return response.redirect(`/daily_standup/edit/${standupId}`);
  }

  Standup.update(standupId, date, did_today.trim(), do_tomorrow.trim(), (blockers || '').trim())
      .then(() => {
        request.session.success = 'Record updated successfully';
        return response.redirect('/daily_standup/history');
      })
      .catch((err) => {
        console.error('Error updating standup:', err);
        request.session.error = 'Error updating record. Please try again.';
        return response.redirect(`/daily_standup/edit/${standupId}`);
      });
};
