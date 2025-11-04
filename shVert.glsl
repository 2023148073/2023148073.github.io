#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 wPos;
out vec3 wNrm;

void main(){
    vec4 wp = u_model * vec4(a_position,1.0);
    wPos = wp.xyz;
    mat3 N = mat3(transpose(inverse(u_model)));
    wNrm = normalize(N * a_normal);
    gl_Position = u_projection * u_view * wp;
}
