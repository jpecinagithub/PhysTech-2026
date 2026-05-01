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

export function convertToMediaPipeFormat(results) {
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

  return { landmarks };
}
