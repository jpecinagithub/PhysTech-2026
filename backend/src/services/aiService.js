const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_API_BASE_URL,
  timeout: 10000,
});

function timeoutPromise(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), ms))
  ]);
}

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

  try {
    const aiPromise = openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a professional sports biomechanics coach. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const response = await timeoutPromise(aiPromise, 15000);

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned invalid JSON');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('AI generation failed, using fallback:', err.message);
    return generateFallbackReport(avgFormScore, alerts, angleAverages);
  }
}

function generateFallbackReport(avgFormScore, alerts, angleAverages) {
  const score = parseFloat(avgFormScore) || 50;
  const alertCount = Object.keys(alerts).length;
  const risk = score > 70 ? 'low' : score > 40 ? 'medium' : 'high';

  const strengths = score > 70
    ? ['Good overall form maintained', 'Consistent performance throughout session']
    : ['Completed the workout session', 'Collected form data for analysis'];

  const improvements = alertCount > 0
    ? [`Address ${Object.keys(alerts)[0]} issues`, 'Focus on maintaining proper form']
    : ['Continue maintaining good form', 'Try increasing workout intensity gradually'];

  return {
    overall_score: score,
    summary: `Session completed with an average form score of ${score}/100. ${alertCount > 0 ? `Detected ${alertCount} form issue(s) that need attention.` : 'No major form issues detected.'}`,
    strengths,
    improvements,
    injury_risk: risk,
    injury_risk_reason: risk === 'low' ? 'Good form reduces injury risk' : 'Form issues may increase injury risk',
    next_session_tip: alertCount > 0 ? `Focus on fixing ${Object.keys(alerts)[0]} in your next session` : 'Keep up the good work and maintain consistency'
  };
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
