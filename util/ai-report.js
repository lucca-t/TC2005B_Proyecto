const {generateText, Output} = require('ai');
const {openai} = require('@ai-sdk/openai');
const {z} = require('zod');

async function generateUserReport(user) {
  // TODO: Define prompt and schema once ready
  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Generate a report for user: ${user.full_name} (${user.email})`,
  });

  return text;
}

module.exports = {generateUserReport};
