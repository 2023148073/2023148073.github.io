#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPos;
uniform vec3 u_objectColor;

out vec3 vColor;

void main(){
    vec4 wp = u_model * vec4(a_position,1.0);
    mat3 Nmat = mat3(transpose(inverse(u_model)));
    vec3 N = normalize(Nmat * a_normal);
    vec3 L = normalize(u_lightPos - wp.xyz);
    vec3 V = normalize(u_cameraPos - wp.xyz);
    vec3 R = reflect(-L, N);

    float ka = 0.22;
    float kd = max(dot(N,L), 0.0);
    float ks = pow(max(dot(R,V), 0.0), 32.0);

    vec3 ambient  = ka * u_objectColor;
    vec3 diffuse  = kd * u_objectColor;
    vec3 specular = ks * vec3(1.0);
    vColor = (ambient + diffuse + specular) * u_lightColor;

    gl_Position = u_projection * u_view * wp;
}
