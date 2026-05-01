CREATE DATABASE IF NOT EXISTS phystech;
USE phystech;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_type ENUM('squat', 'deadlift', 'pushup') NOT NULL,
  duration_seconds INT DEFAULT 0,
  total_reps INT DEFAULT 0,
  avg_form_score DECIMAL(5,2) DEFAULT 0,
  ai_report TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  timestamp_ms INT NOT NULL,
  left_knee_angle DECIMAL(6,2),
  right_knee_angle DECIMAL(6,2),
  hip_angle DECIMAL(6,2),
  back_angle DECIMAL(6,2),
  elbow_angle DECIMAL(6,2),
  form_score DECIMAL(5,2),
  alert_type VARCHAR(100),
  rep_count INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
