
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
        canvas.addEventListener('wheel', this.onWheel.bind(this));
    }
    getArcballVector(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const center = { x: rect.width * 0.5, y: rect.height * 0.5 };
        const x = (screenX - center.x) / center.x;
        const y = (center.y - screenY) / center.y;
        const sqrLen = x * x + y * y;
        const z = sqrLen <= 1.0 ? Math.sqrt(1.0 - sqrLen) : 0;
        const result = vec3.fromValues(x, y, z);
        vec3.normalize(result, result);
        return result;
    }
    onMouseDown(event) {
        this.dragging = true;
        this.lastMouseX = event.clientX; this.lastMouseY = event.clientY;
    }
    onMouseMove(event) {
        if (!this.dragging) return;
        const va = this.getArcballVector(this.lastMouseX, this.lastMouseY);
        const vb = this.getArcballVector(event.clientX, event.clientY);
        const angle = Math.acos(Math.min(1.0, vec3.dot(va, vb))) * this.rotationSensitivity;
        const axis = vec3.create(); vec3.cross(axis, vb, va); vec3.normalize(axis, axis);
        const dq = quat.create(); quat.setAxisAngle(dq, axis, angle);
        quat.multiply(this.rotation, dq, this.rotation);
        this.lastMouseX = event.clientX; this.lastMouseY = event.clientY;
    }
    onMouseUp(){ this.dragging = false; }
    onWheel(event) {
        this.distance += event.deltaY * this.zoomSensitivity * this.distance;
        this.distance = Math.max(0.1, Math.min(100.0, this.distance));
        vec3.set(this.position, 0, 0, this.distance);
        event.preventDefault();
    }
    getViewMatrix() {
        const viewMatrix = mat4.create();
        const R = mat4.create(); mat4.fromQuat(R, this.rotation);
        const eye = vec3.create(); vec3.transformMat4(eye, this.position, R);
        mat4.lookAt(viewMatrix, eye, this.target, this.up);
        return viewMatrix;
    }
    getModelRotMatrix() { const M = mat4.create(); mat4.fromQuat(M, this.rotation); return M; }
    getViewCamDistanceMatrix() {
        const V = mat4.create(); mat4.lookAt(V, this.position, this.target, this.up); return V;
    }
    reset() {
        this.rotation = quat.create();
        this.position = vec3.fromValues(0, 0, this.distance);
        this.target = vec3.fromValues(0, 0, 0);
    }
}
