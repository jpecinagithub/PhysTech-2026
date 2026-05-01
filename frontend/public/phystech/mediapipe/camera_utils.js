// MediaPipe Camera Utils - Loaded from CDN
(function() {
  if (window.CameraUtils) return;
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1620248257/camera_utils.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => console.log('Camera Utils loaded');
  document.head.appendChild(script);
})();
