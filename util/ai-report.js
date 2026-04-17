const {generateText} = require('ai');
const {openai} = require('@ai-sdk/openai');

async function generateUserReport(user, startDate, endDate, standupData) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const systemPrompt = [
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
    '',
    '#### What feedback do you have for me as your manager?',
    '*',
  ].join('\n');

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

module.exports = {generateUserReport};
