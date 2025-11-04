export function resizeAspectRatio(gl, canvas) {
  window.addEventListener('resize', () => {
    const aspect = canvas.width / canvas.height;
    let newW = window.innerWidth;
    let newH = window.innerHeight;
    if (newW / newH > aspect) newW = newH * aspect;
    else newH = newW / aspect;
    canvas.width = newW; canvas.height = newH;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
}
export function setupText(canvas, initialText, line = 1) {
  if (line == 1) { const ex = document.getElementById('textOverlay'); if (ex) ex.remove(); }
  const overlay = document.createElement('div');
  overlay.id = 'textOverlay';
  overlay.style.position = 'fixed';
  overlay.style.left = (canvas.offsetLeft + 10) + 'px';
  overlay.style.top = (canvas.offsetTop + (20 * (line - 1) + 10)) + 'px';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'monospace';
  overlay.style.fontSize = '14px';
  overlay.style.zIndex = '100';
  overlay.textContent = `${initialText}`;
  canvas.parentElement.appendChild(overlay);
  return overlay;
}
export function updateText(overlay, text) { if (overlay) overlay.textContent = `${text}`; }
