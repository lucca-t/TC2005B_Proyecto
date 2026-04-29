const Standup = require('../models/standup.model');

const STANDUP_TEXT_MAX_LENGTH = 65535;

const isDataTooLongError = (error) => {
  return error && (
    error.code === 'ER_DATA_TOO_LONG' ||
    error.errno === 1406 ||
    error.sqlState === '22001'
  );
};

const validateStandupTextLength = (label, value) => {
  const normalizedValue = (value || '').trim();

  if (normalizedValue.length > STANDUP_TEXT_MAX_LENGTH) {
    return `${label} cannot exceed ${STANDUP_TEXT_MAX_LENGTH} characters.`;
  }

  return '';
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

const getApiTokenFromRequest = (request) => {
  const authorization = (request.get('authorization') || '').trim();
  const apiKeyHeader = (request.get('x-api-key') || '').trim();

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return apiKeyHeader;
};

const getNormalizedDisplayName = (value) => {
  return (value || '').trim().replace(/^@/, '');
};

const parseSlackWorkflowPayload = (body) => {
  const payload = body && typeof body === 'object' ? body : {};
  const team = payload.team && typeof payload.team === 'object' ? payload.team : {};
  const user = payload.user && typeof payload.user === 'object' ? payload.user : {};
  const standup = payload.standup && typeof payload.standup === 'object' ? payload.standup : {};

  return {
    source: (payload.source || '').trim(),
    teamName: (team.name || '').trim(),
    slackUserId: (user.slackUserId || '').trim(),
    displayName: getNormalizedDisplayName(user.displayName),
    date: (payload.date || '').trim(),
    didToday: (standup.didToday || '').trim(),
    doingTomorrow: (standup.doingTomorrow || '').trim(),
    blockers: (standup.blockers || '').trim(),
  };
};

const resolveUserId = async (slackUserId, displayName) => {
  if (slackUserId) {
    const [slackRows] = await Standup.getUserIdBySlackId(slackUserId);
    if (slackRows && slackRows.length > 0) {
      return slackRows[0].user_id;
    }
  }

  if (displayName) {
    const [displayRows] = await Standup.getUserIdByDisplayName(displayName);
    if (displayRows && displayRows.length > 0) {
      return displayRows[0].user_id;
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

  const parsedPayload = parseSlackWorkflowPayload(request.body);

  if (parsedPayload.source !== 'slack_workflow') {
    return response.status(400).json({
      ok: false,
      error: 'Invalid source. Expected source: slack_workflow.',
    });
  }

  if (!parsedPayload.teamName) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required field: team.name.',
    });
  }

  if (!parsedPayload.slackUserId) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required field: user.slackUserId.',
    });
  }

  if (!parsedPayload.displayName) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required field: user.displayName.',
    });
  }

  if (!parsedPayload.date) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required field: date.',
    });
  }

  if (!parsedPayload.didToday || !parsedPayload.doingTomorrow) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required fields: standup.didToday and standup.doingTomorrow.',
    });
  }

  const didTodayError = validateStandupTextLength('standup.didToday', parsedPayload.didToday);
  const doingTomorrowError = validateStandupTextLength('standup.doingTomorrow', parsedPayload.doingTomorrow);
  const blockersError = validateStandupTextLength('standup.blockers', parsedPayload.blockers);

  if (didTodayError || doingTomorrowError || blockersError) {
    return response.status(400).json({
      ok: false,
      error: didTodayError || doingTomorrowError || blockersError,
    });
  }

  if (!isValidDateInput(parsedPayload.date)) {
    return response.status(400).json({
      ok: false,
      error: 'Invalid date value. Use YYYY-MM-DD format.',
    });
  }

  try {
    const userId = await resolveUserId(
        parsedPayload.slackUserId,
        parsedPayload.displayName,
    );
    if (!userId) {
      return response.status(404).json({
        ok: false,
        error: 'User not found for provided user.slackUserId/user.displayName.',
      });
    }

    const [existing] = await Standup.checkDuplicate(userId, parsedPayload.date);
    if (existing.length > 0) {
      return response.status(409).json({
        ok: false,
        error: 'A standup report already exists for this user and date.',
      });
    }

    const standup = new Standup(
        parsedPayload.date,
        parsedPayload.didToday,
        parsedPayload.doingTomorrow,
        parsedPayload.blockers,
        userId,
    );
    const [insertResult] = await standup.save();

    return response.status(201).json({
      ok: true,
      message: 'Standup received and stored.',
      mapping: {
        source: parsedPayload.source,
        team_name: parsedPayload.teamName,
        slack_user_id: parsedPayload.slackUserId,
        display_name: parsedPayload.displayName,
      },
      standup: {
        standup_id: insertResult.insertId || null,
        user_id: userId,
        date: parsedPayload.date,
      },
    });
  } catch (err) {
    console.error('Error saving standup from API:', err);
    if (isDataTooLongError(err)) {
      return response.status(400).json({
        ok: false,
        error: `One or more standup fields are too long. Maximum allowed is ${STANDUP_TEXT_MAX_LENGTH} characters.`,
      });
    }
    return response.status(500).json({
      ok: false,
      error: 'Server connection error. Please try again later.',
    });
  }
};
