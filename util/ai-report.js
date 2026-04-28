const {generateText} = require('ai');
const {openai} = require('@ai-sdk/openai');

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;

  // Headers (must be done before other replacements)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="title is-5">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="title is-4">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="title is-3">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Split into paragraphs first to handle lists properly
  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let listContent = '';

  for (const line of lines) {
    // Check if line is already an HTML tag (header, etc)
    if (line.trim().startsWith('<h') || line.trim().startsWith('<div')) {
      if (inList) {
        listContent += '</ul>';
        result.push(listContent);
        inList = false;
        listContent = '';
      }
      result.push(line);
    }
    // Check if line is a list item (starts with *)
    else if (line.trim().startsWith('* ')) {
      if (!inList) {
        inList = true;
        listContent = '<ul>';
      }
      // Extract list item text and handle nested indentation
      const match = line.match(/^(\s*)\* (.+)$/);
      if (match) {
        const indent = match[1].length / 2;
        const text = match[2];
        listContent += '<li style="margin-left: ' + (indent * 20) + 'px;">' + text + '</li>';
      }
    } else if (inList && line.trim() === '') {
      // Empty line ends the list
      listContent += '</ul>';
      result.push(listContent);
      inList = false;
      listContent = '';
    } else if (inList) {
      // Non-list line while in list
      listContent += '</ul>';
      result.push(listContent);
      inList = false;
      listContent = '';
      if (line.trim() !== '') {
        result.push('<p>' + line + '</p>');
      }
    } else {
      // Regular paragraph
      if (line.trim() !== '') {
        result.push('<p>' + line + '</p>');
      }
    }
  }

  // Close any remaining list
  if (inList) {
    listContent += '</ul>';
    result.push(listContent);
  }

  // Join and clean up
  html = result.join('\n');

  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s+<\/p>/g, '');

  // Wrap in content div with styling
  html = '<div class="content">' + html + '</div>';

  return html;
}

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

  return markdownToHtml(text);
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

  return markdownToHtml(text);
}

async function generateProjectReport(project, startDate, endDate, standupData) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const systemPrompt = [
    'You are an expert project manager\'s assistant designed to',
    'synthesize daily engineering standup data from team members',
    'into a structured Project Progress Report.',
    '',
    'CRITICAL INSTRUCTIONS:',
    'You MUST analyze ALL standup entries provided. Extract EVERY piece of information',
    'related to the project: ' + project.name + '.',
    '',
    'WHAT COUNTS AS PROJECT-RELATED:',
    '- Any mention of the project name: "' + project.name + '"',
    '- Any work/features/tasks/bugs related to this project',
    '- Any blockers or challenges affecting this project',
    '- Any discussions about this project\'s components, features, or deliverables',
    '- Team members working on tasks for this project',
    '- Progress toward project milestones',
    '',
    'TASK:',
    'Analyze the standup logs in JSON format. Each entry has: user name, email, date,',
    '"did_today" (completed work), "do_tomorrow" (planned work), and "blockers" (issues).',
    'Extract and synthesize all information related to ' + project.name + '.',
    'The team works at Change.org.',
    '',
    'INSTRUCTIONS:',
    '1. Read EVERY single standup entry carefully.',
    '2. Identify which entries contain work related to "' + project.name + '".',
    '3. Extract specific details: who did what, when, and any blockers.',
    '4. Synthesize the data into the exact Markdown structure below.',
    '5. Look for patterns: recurring blockers, consistent progress, team coordination.',
    '6. Provide actionable recommendations based on the data.',
    '7. Output ONLY raw Markdown - no additional text before or after.',
    '',
    'REQUIRED MARKDOWN OUTPUT FORMAT:',
    '',
    '### Project Progress Report: ' + project.name,
    '',
    '#### Project Overview',
    '* **Current Status:**',
    '  * [Summary of overall progress, momentum, and health]',
    '* **Date Range Analyzed:**',
    '  * [The period covered by these standups]',
    '',
    '#### What has been completed?',
    '* **Delivered Features & Fixes:**',
    '  * [Specific features shipped, bugs fixed, completed tasks with dates]',
    '* **Work in Progress:**',
    '  * [Tasks currently being worked on by specific team members]',
    '* **Quality & Outcomes:**',
    '  * [Testing, deployments, code quality improvements]',
    '',
    '#### What are the current blockers?',
    '* **Technical Blockers:**',
    '  * [Specific technical challenges, dependencies, infrastructure issues]',
    '* **Resource/Team Blockers:**',
    '  * [Staffing, skill gaps, communication issues]',
    '* **External Blockers:**',
    '  * [Dependencies on other teams, waiting on decisions]',
    '',
    '#### Team Coordination & Collaboration',
    '* **Who is working on what:**',
    '  * [Breakdown of team members and their assigned tasks]',
    '* **Key Handoffs & Dependencies:**',
    '  * [Critical dependencies between team members or other teams]',
    '',
    '#### Recommended Actions (Project To-Do List)',
    '* **Immediate - This Week:**',
    '  * [Critical actions to unblock progress immediately]',
    '* **High Priority - Next:**',
    '  * [Important tasks for the coming weeks]',
    '* **Technical Debt:**',
    '  * [Refactoring, testing gaps, or infrastructure improvements needed]',
    '* **Team Improvements:**',
    '  * [Process or collaboration enhancements]',
  ].join('\n');

  const userPrompt = [
    `GENERATE PROJECT REPORT FOR: "${project.name}"`,
    `Period: ${start} to ${end}`,
    '',
    'IMPORTANT: Analyze ALL standups below. Extract EVERY detail related to this project.',
    'Convert the data into the required Markdown format.',
    '',
    'Standup data:',
    JSON.stringify(standupData, null, 2),
  ].join('\n');

  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2,
  });

  // Convert markdown to HTML for proper display
  const htmlReport = markdownToHtml(text);
  return htmlReport;
}

module.exports = {generateUserReport, generateTeamReport, generateProjectReport};
