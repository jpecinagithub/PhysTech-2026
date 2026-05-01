// MediaPipe Pose - Loaded from CDN with WASM fix
(function() {
  if (window.Pose) return;
  
  // Set WASM binary location before loading
  window.Module = window.Module || {};
  window.Module.locateFile = function(file) {
    if (file.endsWith('.wasm')) {
      return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1646424915/' + file;
    }
    return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1646424915/' + file;
  };
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1646424915/pose.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => console.log('MediaPipe Pose loaded successfully');
  script.onerror = () => console.error('Failed to load MediaPipe Pose');
  document.head.appendChild(script);
})();
