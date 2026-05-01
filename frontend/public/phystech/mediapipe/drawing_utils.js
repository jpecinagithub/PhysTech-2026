// MediaPipe Drawing Utils - Loaded from CDN
(function() {
  if (window.drawing_utils) return;
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => console.log('Drawing Utils loaded');
  document.head.appendChild(script);
})();
