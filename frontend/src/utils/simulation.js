// Simulated pose data for hackathon demo
// Generates realistic landmark data based on exercise type

// MediaPipe pose landmark indices
export const LM = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

// Generate simulated landmarks based on exercise and time
let simulationTime = 0;
let simulationPhase = 'up'; // up, down, bottom

export function generateSimulatedLandmarks(exercise, timeMs) {
  const phase = Math.floor(timeMs / 2000) % 2; // Switch every 2 seconds
  simulationPhase = phase === 0 ? 'up' : 'down';
  
  const progress = (timeMs % 2000) / 2000; // 0 to 1 within phase
  const factor = phase === 0 ? progress : 1 - progress; // 0→1 for up, 1→0 for down

  let landmarks = {};

  switch (exercise) {
    case 'squat':
      landmarks = generateSquatLandmarks(factor, simulationPhase);
      break;
    case 'deadlift':
      landmarks = generateDeadliftLandmarks(factor, simulationPhase);
      break;
    case 'pushup':
      landmarks = generatePushupLandmarks(factor, simulationPhase);
      break;
  }

  return landmarks;
}

function generateSquatLandmarks(factor, phase) {
  // Simulate squat: knees go from ~170° (up) to ~90° (down)
  const isDown = phase === 'down';
  const kneeAngle = isDown ? 90 + (80 * (1 - factor)) : 170 - (80 * factor);
  const hipAngle = isDown ? 90 + (70 * (1 - factor)) : 160 - (70 * factor);
  const backAngle = isDown ? 95 - (10 * (1 - factor)) : 85 + (10 * factor);
  
  return {
    [LM.LEFT_HIP]: { x: 0.5, y: 0.6, visibility: 1 },
    [LM.LEFT_KNEE]: { x: 0.45, y: isDown ? 0.7 + (0.1 * factor) : 0.7 - (0.1 * factor), visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.4, y: 0.85, visibility: 1 },
    [LM.RIGHT_HIP]: { x: 0.5, y: 0.6, visibility: 1 },
    [LM.RIGHT_KNEE]: { x: 0.55, y: isDown ? 0.7 + (0.1 * factor) : 0.7 - (0.1 * factor), visibility: 1 },
    [LM.RIGHT_ANKLE]: { x: 0.6, y: 0.85, visibility: 1 },
    [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.45, visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: 0.45, visibility: 1 },
  };
}

function generateDeadliftLandmarks(factor, phase) {
  const isDown = phase === 'down';
  const hipAngle = isDown ? 80 + (80 * (1 - factor)) : 160 - (80 * factor);
  const backAngle = isDown ? 100 - (30 * (1 - factor)) : 70 + (30 * factor);
  
  return {
    [LM.LEFT_HIP]: { x: 0.5, y: 0.55, visibility: 1 },
    [LM.LEFT_KNEE]: { x: 0.48, y: 0.7, visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.45, y: 0.85, visibility: 1 },
    [LM.RIGHT_HIP]: { x: 0.5, y: 0.55, visibility: 1 },
    [LM.RIGHT_KNEE]: { x: 0.52, y: 0.7, visibility: 1 },
    [LM.RIGHT_ANKLE]: { x: 0.55, y: 0.85, visibility: 1 },
    [LM.LEFT_SHOULDER]: { x: 0.5, y: isDown ? 0.4 + (0.1 * factor) : 0.4 - (0.1 * factor), visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: isDown ? 0.4 + (0.1 * factor) : 0.4 - (0.1 * factor), visibility: 1 },
  };
}

function generatePushupLandmarks(factor, phase) {
  const isDown = phase === 'down';
  const elbowAngle = isDown ? 90 + (70 * (1 - factor)) : 160 - (70 * factor);
  const bodyAngle = isDown ? 165 + (10 * (1 - factor)) : 175 - (10 * factor);
  
  return {
    [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.5, visibility: 1 },
    [LM.LEFT_ELBOW]: { x: isDown ? 0.45 - (0.05 * factor) : 0.45 + (0.05 * factor), y: 0.65, visibility: 1 },
    [LM.LEFT_WRIST]: { x: 0.42, y: 0.7, visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: 0.5, visibility: 1 },
    [LM.RIGHT_ELBOW]: { x: isDown ? 0.55 + (0.05 * factor) : 0.55 - (0.05 * factor), y: 0.65, visibility: 1 },
    [LM.RIGHT_WRIST]: { x: 0.58, y: 0.7, visibility: 1 },
    [LM.LEFT_HIP]: { x: 0.5, y: 0.75, visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.5, y: 0.95, visibility: 1 },
  };
}

export function getSimulationPhase() {
  return simulationPhase;
}
