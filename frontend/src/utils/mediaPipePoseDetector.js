import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

let poseLandmarker = null;
let runningMode = 'VIDEO';

export async function initializePoseDetection() {
  if (poseLandmarker) return poseLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU'
    },
    runningMode: runningMode,
    numPoses: 1
  });

  return poseLandmarker;
}

export async function detectPose(video) {
  if (!poseLandmarker) {
    await initializePoseDetection();
  }

  const detections = poseLandmarker.detectForVideo(video, performance.now());
  return detections;
}

export function convertToMediaPipeFormat(detections) {
  if (!detections || !detections.landmarks || detections.landmarks.length === 0) {
    return null;
  }

  const landmarks = {};
  const poseLandmarks = detections.landmarks[0];

  poseLandmarks.forEach((landmark, index) => {
    landmarks[index] = {
      x: landmark.x,
      y: landmark.y,
      visibility: landmark.visibility || 1.0
    };
  });

  return { landmarks };
}
