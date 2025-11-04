
import { Shader } from './shader.js';

export function resizeAspectRatio(gl, canvas) {
    window.addEventListener('resize', () => {
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        const aspectRatio = originalWidth / originalHeight;
        let newWidth = window.innerWidth;
        let newHeight = window.innerHeight;
        if (newWidth / newHeight > aspectRatio) newWidth = newHeight * aspectRatio;
        else newHeight = newWidth / aspectRatio;
        canvas.width = newWidth; canvas.height = newHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });
}

export function setupText(canvas, initialText, line = 1) {
    if (line == 1) {
        const existingOverlay = document.getElementById('textOverlay');
        if (existingOverlay) existingOverlay.remove();
    }
    const overlay = document.createElement('div');
    overlay.id = 'textOverlay';
    overlay.style.position = 'fixed';
    overlay.style.left = canvas.offsetLeft + 10 + 'px';
    overlay.style.top = canvas.offsetTop + (20 * (line - 1) + 10) + 'px';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'monospace';
    overlay.style.fontSize = '14px';
    overlay.style.zIndex = '100';
    overlay.textContent = `${initialText}`;
    canvas.parentElement.appendChild(overlay);
    return overlay;
}

export function updateText(overlay, text) { if (overlay) overlay.textContent = `${text}`; }

export class Axes {
    constructor(gl, length = 1.0) {
        this.gl = gl; this.length = length;
        this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
        this.vertices = new Float32Array([ -length,0,0,  length,0,0,  0,-length,0,  0,length,0,  0,0,-length,  0,0,length ]);
        this.colors = new Float32Array([ 1,0.3,0,1, 1,0.3,0,1,  0,1,0.5,1, 0,1,0.5,1,  0,0,1,1, 0,0,1,1 ]);
        const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
        const cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb); gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(1);
        gl.bindVertexArray(null);
        const vs = `#version 300 es
        layout(location=0) in vec3 a_position;
        layout(location=1) in vec4 a_color;
        out vec4 v_color;
        uniform mat4 u_model,u_view,u_projection;
        void main(){ gl_Position=u_projection*u_view*u_model*vec4(a_position,1.0); v_color=a_color; }`;
        const fs = `#version 300 es
        precision highp float;
        in vec4 v_color; out vec4 fragColor; void main(){ fragColor=v_color; }`;
        this.shader = new Shader(gl, vs, fs);
    }
    draw(viewMatrix, projMatrix) {
        const gl = this.gl; this.shader.use();
        const modelMatrix = mat4.create();
        this.shader.setMat4('u_model', modelMatrix);
        this.shader.setMat4('u_view', viewMatrix);
        this.shader.setMat4('u_projection', projMatrix);
        gl.bindVertexArray(this.vao); gl.drawArrays(gl.LINES, 0, 6); gl.bindVertexArray(null);
    }
    delete(){ this.gl.deleteVertexArray(this.vao); this.shader.delete?.(); }
}
