const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL,
  timeout: 30000,
});

async function generateSessionReport(exerciseType, metrics, totalReps, durationSeconds) {
  const avgFormScore = metrics.length
    ? (metrics.reduce((sum, m) => sum + (m.form_score || 0), 0) / metrics.length).toFixed(1)
    : 0;

  const alerts = metrics
    .filter((m) => m.alert_type)
    .map((m) => m.alert_type)
    .reduce((acc, alert) => {
      acc[alert] = (acc[alert] || 0) + 1;
      return acc;
    }, {});

  const angleAverages = computeAngleAverages(exerciseType, metrics);

  const prompt = `You are an expert sports biomechanics coach. Analyze this workout session and provide a professional report.

Exercise: ${exerciseType.toUpperCase()}
Duration: ${durationSeconds} seconds
Total Reps: ${totalReps}
Average Form Score: ${avgFormScore}/100

Angle Averages:
${JSON.stringify(angleAverages, null, 2)}

Form Issues Detected (alert type -> count):
${Object.keys(alerts).length ? JSON.stringify(alerts, null, 2) : 'None detected - excellent form!'}

Provide a JSON response with this exact structure:
{
  "overall_score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "injury_risk": "<low|medium|high>",
  "injury_risk_reason": "<brief explanation>",
  "next_session_tip": "<one actionable tip for next session>"
}`;

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
      { role: 'system', content: 'You are a professional sports biomechanics coach. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = response.choices[0].message.content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned invalid JSON');
  return JSON.parse(jsonMatch[0]);
}

function computeAngleAverages(exerciseType, metrics) {
  if (!metrics.length) return {};
  const sum = {};
  const count = {};
  const angleKeys = ['left_knee_angle', 'right_knee_angle', 'hip_angle', 'back_angle', 'elbow_angle'];

  for (const m of metrics) {
    for (const key of angleKeys) {
      if (m[key] != null) {
        sum[key] = (sum[key] || 0) + parseFloat(m[key]);
        count[key] = (count[key] || 0) + 1;
      }
    }
  }

  const result = {};
  for (const key of angleKeys) {
    if (count[key]) result[key] = parseFloat((sum[key] / count[key]).toFixed(1));
  }
  return result;
}

module.exports = { generateSessionReport };
