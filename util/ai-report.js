const {generateText} = require('ai');
const {openai} = require('@ai-sdk/openai');

async function generateUserReport(user, startDate, endDate, standupData, role) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const systemPromptLines = [
    'You are an expert engineering manager\'s assistant designed to',
    'synthesize daily engineering standup data into a structured',
    'Quarterly Performance Review Self-Evaluation.',
    '',
    'CONTEXT & VALUES:',
    'Analyze 3 months of daily standup logs in JSON format with',
    '\'yesterday\', \'today\', and \'blockers\'. The engineer works at',
    'Change.org. Look for alignment with fairness, equality, justice,',
    'empowerment, transparency, and social impact.',
    '',
    'INSTRUCTIONS:',
    '1. Analyze the provided standup data.',
    '2. Synthesize it into the exact Markdown structure below.',
    '3. Keep bullets short and focused on quarter-level narrative.',
    '4. Extrapolate wins from consistently completed tasks.',
    '5. Extrapolate improvements from recurring blockers and delays.',
    '6. Output ONLY raw Markdown.',
    '',
    'REQUIRED MARKDOWN OUTPUT FORMAT:',
    '',
    '### Quarterly Performance Review Self-Evaluation',
    '',
    '#### What went well?',
    '* **Overall wins:**',
    '  * [Major shipped features, resolved bugs, consistent outputs]',
    '* **Successful execution:**',
    '  * [How/why success happened based on data patterns]',
    '* **Growth and Progress:**',
    '  * [Efficiency gains or blockers overcome over 3 months]',
    '* **Cultural Contributions:**',
    '  * [Alignment with public good, fairness, equality, justice]',
    '',
    '#### What could be improved?',
    '* **Challenges & Areas for Improvement:**',
    '  * [Recurring blockers, delayed tasks, technical struggles]',
    '* **Where things fell short:**',
    '  * [Specific trends where tasks were blocked or unfinished]',
    '* **Ongoing challenges:**',
    '  * [Why blockers persisted]',
    '* **Team & Culture connection:**',
    '  * [Collaboration consistency or isolation signals]',
  ];

  if (role !== 'Member') {
    systemPromptLines.push(
        '',
        '#### What feedback do you have for me as your manager?',
        '*',
    );
  }

  const systemPrompt = systemPromptLines.join('\n');

  const userPrompt = [
    `Generate a report for user: ${user.full_name} (${user.email})`,
    `from ${start} to ${end}.`,
    '',
    'Here is the daily standup data:',
    JSON.stringify(standupData),
  ].join('\n');

  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2,
  });

  return text;
}

async function generateTeamReport(team, startDate, endDate, standupData) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const systemPrompt = [
    'You are an expert engineering manager\'s assistant designed to',
    'synthesize daily engineering standup data from an entire team',
    'into a structured Team Quarterly Performance Review.',
    '',
    'CONTEXT & VALUES:',
    'Analyze standup logs in JSON format. Each entry has a user name,',
    'email, date, \'did_today\', \'do_tomorrow\', and \'blockers\'.',
    'The team works at Change.org. Look for alignment with fairness,',
    'equality, justice, empowerment, transparency, and social impact.',
    '',
    'INSTRUCTIONS:',
    '1. Analyze the provided standup data across all team members.',
    '2. Synthesize it into the exact Markdown structure below.',
    '3. Highlight team-level patterns, collaboration signals,',
    '   shared blockers, and collective achievements.',
    '4. Keep bullets short and focused on quarter-level narrative.',
    '5. Output ONLY raw Markdown.',
    '',
    'REQUIRED MARKDOWN OUTPUT FORMAT:',
    '',
    '### Team Quarterly Performance Review',
    '',
    '#### What went well as a team?',
    '* **Collective wins:**',
    '  * [Major shipped features, resolved bugs, consistent outputs]',
    '* **Collaboration highlights:**',
    '  * [Cross-member support, unblocking patterns, team synergy]',
    '* **Growth and Progress:**',
    '  * [Efficiency gains or team blockers overcome over 3 months]',
    '* **Cultural Contributions:**',
    '  * [Alignment with public good, fairness, equality, justice]',
    '',
    '#### What could the team improve?',
    '* **Recurring team blockers:**',
    '  * [Shared blockers, delayed tasks, technical struggles]',
    '* **Coordination gaps:**',
    '  * [Where communication or handoffs fell short]',
    '* **Ongoing challenges:**',
    '  * [Why blockers persisted across team members]',
    '',
    '#### Individual highlights',
    '* [Brief per-member summary of standout contributions]',
    '',
    '#### Recommendations for the team',
    '*',
  ].join('\n');

  const userPrompt = [
    `Generate a team report for: ${team.team_name}`,
    `from ${start} to ${end}.`,
    '',
    'Here is the daily standup data for all team members:',
    JSON.stringify(standupData),
  ].join('\n');

  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2,
  });

  return text;
}

module.exports = {generateUserReport, generateTeamReport};
