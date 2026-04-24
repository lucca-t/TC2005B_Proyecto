const Standup = require('../models/standup.model');

const getTodayDateString = () => new Date().toISOString().split('T')[0];

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

const getApiTokenFromRequest = (request) => {
  const authorization = (request.get('authorization') || '').trim();
  const apiKeyHeader = (request.get('x-api-key') || '').trim();

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return apiKeyHeader;
};

const getStandupPayload = (body) => {
  if (body && typeof body.standup === 'object' && body.standup !== null) {
    return body.standup;
  }

  return body || {};
};

const getUserIdentifiers = (body) => {
  const nestedUser = body && typeof body.user === 'object' ? body.user : {};

  const slackId = (
    nestedUser.slack_id ||
    nestedUser.slackId ||
    body.slack_id ||
    body.slackId ||
    ''
  ).trim();

  const email = (
    nestedUser.email ||
    body.email ||
    ''
  ).trim().toLowerCase();

  return {slackId, email};
};

const resolveUserId = async (slackId, email) => {
  if (slackId) {
    const [slackRows] = await Standup.getUserIdBySlackId(slackId);
    if (slackRows && slackRows.length > 0) {
      return slackRows[0].user_id;
    }
  }

  if (email) {
    const [emailRows] = await Standup.getUserId(email);
    if (emailRows && emailRows.length > 0) {
      return emailRows[0].user_id;
    }
  }

  return null;
};

exports.post_slack_standup = async (request, response, next) => {
  const configuredToken = (process.env.STANDUP_API_TOKEN || '').trim();

  if (!configuredToken) {
    return response.status(503).json({
      ok: false,
      error: 'Standup API token is not configured on the server.',
    });
  }

  const incomingToken = getApiTokenFromRequest(request);
  if (!incomingToken || incomingToken !== configuredToken) {
    return response.status(401).json({
      ok: false,
      error: 'Unauthorized',
    });
  }

  const payload = request.body && typeof request.body === 'object' ?
    request.body : {};
  const standupPayload = getStandupPayload(payload);

  const didToday = (
    standupPayload.did_today ||
    standupPayload.didToday ||
    ''
  ).trim();
  const doTomorrow = (
    standupPayload.do_tomorrow ||
    standupPayload.doTomorrow ||
    ''
  ).trim();
  const blockers = (standupPayload.blockers || '').trim();
  const date = (standupPayload.date || '').trim() || getTodayDateString();

  if (!didToday || !doTomorrow) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required fields: did_today and do_tomorrow.',
    });
  }

  if (!isValidDateInput(date)) {
    return response.status(400).json({
      ok: false,
      error: 'Invalid date value. Use YYYY-MM-DD format.',
    });
  }

  const {slackId, email} = getUserIdentifiers(payload);
  if (!slackId && !email) {
    return response.status(400).json({
      ok: false,
      error: 'Provide user.slack_id or user.email to match a user record.',
    });
  }

  try {
    const userId = await resolveUserId(slackId, email);
    if (!userId) {
      return response.status(404).json({
        ok: false,
        error: 'User not found for provided slack_id/email.',
      });
    }

    const [existing] = await Standup.checkDuplicate(userId, date);
    if (existing.length > 0) {
      return response.status(409).json({
        ok: false,
        error: 'A standup report already exists for this user and date.',
      });
    }

    const standup = new Standup(date, didToday, doTomorrow, blockers, userId);
    const [insertResult] = await standup.save();

    return response.status(201).json({
      ok: true,
      message: 'Standup received and stored.',
      standup: {
        standup_id: insertResult.insertId || null,
        user_id: userId,
        date,
      },
    });
  } catch (err) {
    console.error('Error saving standup from API:', err);
    return response.status(500).json({
      ok: false,
      error: 'Server connection error. Please try again later.',
    });
  }
};
