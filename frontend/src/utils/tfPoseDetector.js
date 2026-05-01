import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs';

let detector = null;

export async function initializePoseDetection() {
  if (detector) return detector;

  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    modelType: 'full'
  };

  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
}

export async function detectPose(video) {
  if (!detector) {
    await initializePoseDetection();
  }

  const poses = await detector.estimatePoses(video);
  return poses;
}

export function convertToMediaPipeFormat(poses) {
  if (!poses || poses.length === 0) return null;

  const pose = poses[0];
  const landmarks = {};

  pose.keypoints.forEach((keypoint) => {
    landmarks[keypoint.index] = {
      x: keypoint.x / 640, // Normalize to 0-1
      y: keypoint.y / 480,
      visibility: keypoint.score || 1.0
    };
  });

  return {
    landmarks,
    worldLandmarks: pose.keypoints3D?.reduce((acc, kp, idx) => {
      acc[idx] = kp;
      return acc;
    }, {}) || null
  };
}
