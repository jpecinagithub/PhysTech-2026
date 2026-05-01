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
      landmarks = generateSquatLandmarks(factor);
      break;
    case 'deadlift':
      landmarks = generateDeadliftLandmarks(factor);
      break;
    case 'pushup':
      landmarks = generatePushupLandmarks(factor);
      break;
  }

  return landmarks;
}

function generateSquatLandmarks(factor) {
  // Simulate squat: knees go from ~170° (up) to ~90° (down)
  const kneeAngle = 170 - (80 * factor); // 170 → 90
  const hipAngle = 160 - (70 * factor); // 160 → 90
  const backAngle = 85 + (10 * factor); // 85 → 95 (slight lean)
  
  return {
    [LM.LEFT_HIP]: { x: 0.5, y: 0.6, visibility: 1 },
    [LM.LEFT_KNEE]: { x: 0.45, y: 0.7, visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.4, y: 0.85, visibility: 1 },
    [LM.RIGHT_HIP]: { x: 0.5, y: 0.6, visibility: 1 },
    [LM.RIGHT_KNEE]: { x: 0.55, y: 0.7, visibility: 1 },
    [LM.RIGHT_ANKLE]: { x: 0.6, y: 0.85, visibility: 1 },
    [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.45, visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: 0.45, visibility: 1 },
  };
}

function generateDeadliftLandmarks(factor) {
  // Simulate deadlift: hip hinge
  const hipAngle = 160 - (80 * factor); // 160 → 80
  const backAngle = 70 + (30 * factor); // 70 → 100
  
  return {
    [LM.LEFT_HIP]: { x: 0.5, y: 0.55, visibility: 1 },
    [LM.LEFT_KNEE]: { x: 0.48, y: 0.7, visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.45, y: 0.85, visibility: 1 },
    [LM.RIGHT_HIP]: { x: 0.5, y: 0.55, visibility: 1 },
    [LM.RIGHT_KNEE]: { x: 0.52, y: 0.7, visibility: 1 },
    [LM.RIGHT_ANKLE]: { x: 0.55, y: 0.85, visibility: 1 },
    [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.4, visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: 0.4, visibility: 1 },
  };
}

function generatePushupLandmarks(factor) {
  // Simulate pushup: elbows go from ~160° (up) to ~90° (down)
  const elbowAngle = 160 - (70 * factor); // 160 → 90
  const bodyAngle = 175 - (10 * factor); // 175 → 165 (body line)
  
  return {
    [LM.LEFT_SHOULDER]: { x: 0.5, y: 0.5, visibility: 1 },
    [LM.LEFT_ELBOW]: { x: 0.45, y: 0.65, visibility: 1 },
    [LM.LEFT_WRIST]: { x: 0.42, y: 0.7, visibility: 1 },
    [LM.RIGHT_SHOULDER]: { x: 0.5, y: 0.5, visibility: 1 },
    [LM.RIGHT_ELBOW]: { x: 0.55, y: 0.65, visibility: 1 },
    [LM.RIGHT_WRIST]: { x: 0.58, y: 0.7, visibility: 1 },
    [LM.LEFT_HIP]: { x: 0.5, y: 0.75, visibility: 1 },
    [LM.LEFT_ANKLE]: { x: 0.5, y: 0.95, visibility: 1 },
  };
}

export function getSimulationPhase() {
  return simulationPhase;
}
