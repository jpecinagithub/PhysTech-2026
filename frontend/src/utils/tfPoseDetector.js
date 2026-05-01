import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

let detector = null;

export async function initializePoseDetection() {
  if (detector) return detector;

  await tf.ready();

  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
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

  // MoveNet has 17 keypoints, we need to map to MediaPipe's 33
  pose.keypoints.forEach((keypoint) => {
    // Use the keypoint index directly (0-16 for MoveNet)
    // MediaPipe pose uses 0-32, so we'll map to similar positions
    const mpIndex = keypoint.index;
    landmarks[mpIndex] = {
      x: keypoint.x / 640,
      y: keypoint.y / 480,
      visibility: keypoint.score || 1.0
    };
  });

  return { landmarks };
}
