export class Arcball {
  constructor(canvas, distance = 5.0, sensitivity = { rotation: 1.0, zoom: 0.001 }) {
    this.canvas = canvas;
    this.distance = distance;
    this.rotation = quat.create();
    this.position = vec3.fromValues(0, 0, distance);
    this.target = vec3.create();
    this.up = vec3.fromValues(0, 1, 0);
    this.rotationSensitivity = sensitivity.rotation || 1.0;
    this.zoomSensitivity = sensitivity.zoom || 0.001;
    this.dragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('wheel', this.onWheel.bind(this), {passive:false});
  }
  getArcballVector(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width * 0.5, cy = rect.height * 0.5;
    const x = (screenX - cx) / cx;
    const y = (cy - screenY) / cy;
    const d = x*x + y*y;
    const z = d <= 1.0 ? Math.sqrt(1.0 - d) : 0.0;
    const v = vec3.fromValues(x,y,z);
    vec3.normalize(v,v);
    return v;
  }
  onMouseDown(e){ this.dragging = true; this.lastMouseX = e.clientX; this.lastMouseY = e.clientY; }
  onMouseMove(e){
    if (!this.dragging) return;
    const va = this.getArcballVector(this.lastMouseX, this.lastMouseY);
    const vb = this.getArcballVector(e.clientX, e.clientY);
    const angle = Math.acos(Math.min(1.0, vec3.dot(va, vb))) * this.rotationSensitivity;
    const axis = vec3.create(); vec3.cross(axis, vb, va); vec3.normalize(axis, axis);
    const dq = quat.create(); quat.setAxisAngle(dq, axis, angle);
    quat.multiply(this.rotation, dq, this.rotation);
    this.lastMouseX = e.clientX; this.lastMouseY = e.clientY;
  }
  onMouseUp(){ this.dragging = false; }
  onWheel(e){
    this.distance += e.deltaY * this.zoomSensitivity * this.distance;
    this.distance = Math.max(0.1, Math.min(100.0, this.distance));
    vec3.set(this.position, 0, 0, this.distance);
    e.preventDefault();
  }
  getViewMatrix(){
    const V = mat4.create();
    const R = mat4.create(); mat4.fromQuat(R, this.rotation);
    const eye = vec3.create(); vec3.transformMat4(eye, this.position, R);
    mat4.lookAt(V, eye, this.target, this.up);
    return V;
  }
  getModelRotMatrix(){ const M = mat4.create(); mat4.fromQuat(M, this.rotation); return M; }
  getViewCamDistanceMatrix(){
    const V = mat4.create();
    mat4.lookAt(V, this.position, this.target, this.up);
    return V;
  }
  reset(){
    this.rotation = quat.create();
    this.position = vec3.fromValues(0, 0, this.distance);
    this.target = vec3.fromValues(0, 0, 0);
  }
}
