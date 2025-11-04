#version 300 es
precision highp float;
in vec3 v_lightingColor;
out vec4 FragColor;
void main() { FragColor = vec4(v_lightingColor, 1.0); }
