// VERTEX_SHADER
attribute vec4 a_Position;
uniform vec4 u_Color;
varying vec4 v_Color;

void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
    v_Color = u_Color;
}

// FRAGMENT_SHADER
precision mediump float;
varying vec4 v_Color;

void main() {
    gl_FragColor = v_Color;
}
