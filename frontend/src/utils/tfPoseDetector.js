// MediaPipe Pose Detection using CDN (like hatrek-app)
// Loads MediaPipe Vision from CDN to avoid bundle issues

let poseLandmarker = null;
let visionReady = false;

// Load MediaPipe Vision from CDN
async function loadVision() {
  if (visionReady) return;

  // Load the WASM and Vision files
  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs';
    script.type = 'module';
    script.onload = resolve;
    document.head.appendChild(script);
  });

  visionReady = true;
}

export async function initializePoseDetection() {
  if (poseLandmarker) return poseLandmarker;

  await loadVision();

  // Wait for vision to be available
  const { PoseLandmarker, FilesetResolver } = await import(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs'
  );

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numPoses: 1
  });

  return poseLandmarker;
}

export async function detectPose(video) {
  if (!poseLandmarker) {
    await initializePoseDetection();
  }

  const results = poseLandmarker.detectForVideo(video, performance.now());
  return results;
}

export function convertToMediaPipeFormat(results, exercise) {
  if (!results || !results.landmarks || results.landmarks.length === 0) {
    return null;
  }

  const landmarks = {};
  const poseLandmarks = results.landmarks[0];

  poseLandmarks.forEach((landmark, index) => {
    landmarks[index] = {
      x: landmark.x,
      y: landmark.y,
      visibility: landmark.visibility || 1.0
    };
  });

  // Calculate angles from landmarks (replicate what analyzeFrame does)
  const angles = {};
  
  if (landmarks[25] && landmarks[23] && landmarks[24]) {
    // Left knee, hip, right hip
    angles.left_knee_angle = calculateAngle(
      { x: landmarks[23].x, y: landmarks[23].y },
      { x: landmarks[25].x, y: landmarks[25].y },
      { x: landmarks[24].x, y: landmarks[24].y }
    );
  }
  
  if (landmarks[26] && landmarks[24] && landmarks[23]) {
    angles.right_knee_angle = calculateAngle(
      { x: landmarks[24].x, y: landmarks[24].y },
      { x: landmarks[26].x, y: landmarks[26].y },
      { x: landmarks[23].x, y: landmarks[23].y }
    );
  }

  if (landmarks[23] && landmarks[25] && landmarks[27]) {
    angles.hip_angle = calculateAngle(
      { x: landmarks[25].x, y: landmarks[25].y },
      { x: landmarks[23].x, y: landmarks[23].y },
      { x: landmarks[27].x, y: landmarks[27].y }
    );
  }

  return { landmarks, angles };
}

function calculateAngle(p1, p2, p3) {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return Math.round(angle);
}
