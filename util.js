// util.js
import { Shader } from './shader.js';

export function resizeAspectRatio(gl, canvas) {
  window.addEventListener('resize', () => {
    const aspect = canvas.width / canvas.height;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > aspect) w = h * aspect;
    else h = w / aspect;
    canvas.width = w; canvas.height = h;
    gl.viewport(0,0,canvas.width,canvas.height);
  });
}

export function setupText(canvas, text, line=1) {
  if (line === 1) {
    // clear old
    document.querySelectorAll('.overlayLine').forEach(n => n.remove());
  }
  const el = document.createElement('div');
  el.className = 'overlayLine';
  el.style.position = 'fixed';
  el.style.left = (canvas.offsetLeft + 12) + 'px';
  el.style.top  = (canvas.offsetTop + 12 + (line-1)*20) + 'px';
  el.style.color = '#ffffff';
  el.style.fontFamily = 'monospace';
  el.style.fontSize = '14px';
  el.style.whiteSpace = 'pre';
  el.style.pointerEvents = 'none';
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}

export function updateText(el, text) {
  if (el) el.textContent = text;
}
