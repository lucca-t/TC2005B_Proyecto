const {generateText} = require('ai');
const {openai} = require('@ai-sdk/openai');
const Standup = require('../models/standup.model');

async function generateUserReport(user, startDate, endDate) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const {text} = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Generate a report for user: ${user.full_name} (${user.email}) from ${start} to ${end}`,
  });

  return text;
}

async function generateTeamReport(team, startDate, endDate) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  const [standupsRows] = await Standup.getStandupsByTeam(team.team_id, start, end);
  const standups = standupsRows.map(row => ({
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date).slice(0, 10),
    did_today: row.did_today,
    do_tomorrow: row.do_tomorrow,
    blockers: row.blockers,
    user: row.full_name
  }));

  const prompt = `
Self Reviews
Things to keep in mind
Keep the information short and to the point by using precise bullet points
You are only looking back at the previous quarter
*Do not spend more than an hour on completing your self reviews
if you are a manager. incorporate feedback that you received from your direct reports

Guidance by question
• What went well?
• Things to think about.
Overall what felt like a win?
Based on the expectations set by your manager, what or how did you successfully execute?
• How or why were you able to be successful?
• Look back at your areas for growth from your last reviews. What did your manager mention? How did you progress in these areas? If so, how?
• How did you positively contribute to culture at Change through our values?
• What could be improved?
• Things to think about.
Overall, what felt challenging? Or, where was there room for improvement?
• Based on the expectations set by your manager, where did things fall short, did not go well, or feel challenging?
• How or why did things feel challenging or not go well?
• Look back at your areas for growth from your last reviews. Were the areas mentioned still a challenge? If not, what did you do to address them? If yes, why do you think this is still a challenge?
• Did you feel disconnected from your team or the culture? How? Why do you think that is?
• What feedback do you have for me as your manager?
Things to think about.
Are your 1:1s effective?
Do they give timely feedback?
• Do you feel like you have open lines of communication?
Do you have the clarity you need to do your work?
Are there things they can do to better support you or help you grow?

Team: ${team.team_name}
Period: ${start} to ${end}

Standups:
${standups.map(s => `
User: ${s.user}
Date: ${s.date}
- Did today: ${s.did_today}
- Will do tomorrow: ${s.do_tomorrow}
- Blockers: ${s.blockers || 'None'}
`).join('\n')}

Provide short, precise bullet points using the structure above. If any question cannot be answered from the data, say so briefly.
`;

  try {
    const {text} = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    });

    return text;
  } catch (error) {
    console.error('AI report generation failed:', error);
    return buildFallbackTeamReport(team, start, end, standups);
  }
}

function buildFallbackTeamReport(team, start, end, standups) {
  const summary = [];
  summary.push(`Reporte de equipo para "${team.team_name}" del período ${start} al ${end}.`);
  summary.push('');

  if (standups.length === 0) {
    summary.push('No se encontraron standups para el período seleccionado.');
    return summary.join('\n');
  }

  summary.push(`Total de entradas de standup: ${standups.length}`);
  const blockersCount = standups.filter(s => s.blockers && s.blockers.trim() !== '').length;
  summary.push(`Días con blockers registrados: ${blockersCount}`);
  summary.push('');

  const users = [...new Set(standups.map(s => s.user))];
  users.forEach(user => {
    const userStandups = standups.filter(s => s.user === user);
    summary.push(`Miembro: ${user} (${userStandups.length} standups)`);
    userStandups.forEach(s => {
      summary.push(`  - ${s.date}: Hizo hoy: ${s.did_today || 'N/A'}; Hará mañana: ${s.do_tomorrow || 'N/A'}; Blockers: ${s.blockers || 'Ninguno'}`);
    });
    summary.push('');
  });

  summary.push('thing to keep in mind');
  summary.push(`- El equipo debe prestar atención a los blockers más repetidos (${blockersCount} días con blockers).`);
  summary.push('');
  summary.push('what went well');
  summary.push(`- Se registraron ${standups.length} standups durante el período, mostrando actividad constante del equipo.`);
  summary.push('');
  summary.push('what could be improved');
  summary.push(`- Mejorar la resolución de blockers para evitar que sigan repitiéndose en múltiples días.`);
  summary.push('');
  summary.push('Detalle por miembro:');
  users.forEach(user => {
    const userStandups = standups.filter(s => s.user === user);
    summary.push(`- ${user}: ${userStandups.length} standups.`);
  });
  return summary.join('\n');
}

module.exports = {generateUserReport, generateTeamReport};
