const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { generateSessionReport } = require('../services/aiService');

const router = express.Router();
router.use(authMiddleware);

// GET /api/sessions — list user sessions
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, exercise_type, duration_seconds, total_reps, avg_form_score, ai_report, created_at
       FROM sessions WHERE user_id = ? ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions/:id — session detail with metrics
router.get('/:id', async (req, res) => {
  try {
    const [sessions] = await pool.query(
      'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!sessions.length) return res.status(404).json({ error: 'Session not found' });

    const [metrics] = await pool.query(
      'SELECT * FROM session_metrics WHERE session_id = ? ORDER BY timestamp_ms ASC',
      [req.params.id]
    );

    res.json({ session: sessions[0], metrics });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sessions — save a completed session
router.post('/', async (req, res) => {
  const { exercise_type, duration_seconds, total_reps, avg_form_score, metrics } = req.body;
  if (!exercise_type) return res.status(400).json({ error: 'exercise_type required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO sessions (user_id, exercise_type, duration_seconds, total_reps, avg_form_score) VALUES (?, ?, ?, ?, ?)',
      [req.userId, exercise_type, duration_seconds || 0, total_reps || 0, avg_form_score || 0]
    );
    const sessionId = result.insertId;

    if (metrics && metrics.length) {
      const values = metrics.map((m) => [
        sessionId,
        m.timestamp_ms || 0,
        m.left_knee_angle ?? null,
        m.right_knee_angle ?? null,
        m.hip_angle ?? null,
        m.back_angle ?? null,
        m.elbow_angle ?? null,
        m.form_score ?? null,
        m.alert_type ?? null,
        m.rep_count || 0,
      ]);
      await pool.query(
        `INSERT INTO session_metrics
         (session_id, timestamp_ms, left_knee_angle, right_knee_angle, hip_angle, back_angle, elbow_angle, form_score, alert_type, rep_count)
         VALUES ?`,
        [values]
      );
    }

    res.status(201).json({ sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sessions/:id/report — generate AI report
router.post('/:id/report', async (req, res) => {
  try {
    const [sessions] = await pool.query(
      'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!sessions.length) return res.status(404).json({ error: 'Session not found' });

    const session = sessions[0];
    if (session.ai_report) {
      return res.json({ report: JSON.parse(session.ai_report) });
    }

    const [metrics] = await pool.query(
      'SELECT * FROM session_metrics WHERE session_id = ?',
      [req.params.id]
    );

    const report = await generateSessionReport(
      session.exercise_type,
      metrics,
      session.total_reps,
      session.duration_seconds
    );

    await pool.query('UPDATE sessions SET ai_report = ? WHERE id = ?', [
      JSON.stringify(report),
      session.id,
    ]);

    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/sessions/progress/summary — aggregated stats for progress charts
router.get('/progress/summary', async (req, res) => {
  try {
    const [byExercise] = await pool.query(
      `SELECT exercise_type,
              COUNT(*) as total_sessions,
              SUM(total_reps) as total_reps,
              AVG(avg_form_score) as avg_score,
              SUM(duration_seconds) as total_duration
       FROM sessions WHERE user_id = ?
       GROUP BY exercise_type`,
      [req.userId]
    );

    const [trend] = await pool.query(
      `SELECT DATE(created_at) as date, AVG(avg_form_score) as avg_score, SUM(total_reps) as reps
       FROM sessions WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [req.userId]
    );

    res.json({ byExercise, trend });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
