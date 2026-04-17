const {generateText, Output} = require('ai');
const {openai} = require('@ai-sdk/openai');
const {z} = require('zod');

async function generateUserReport(user, startDate, endDate) {
  // TODO: Define prompt and schema once ready
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Generate a report for user: ${user.full_name} (${user.email}) from ${start} to ${end}`,
  });

  return text;
}

module.exports = {generateUserReport};
