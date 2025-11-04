#version 300 es
precision highp float;

in vec3 wPos;
in vec3 wNrm;

uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPos;
uniform vec3 u_objectColor;

out vec4 fragColor;

void main(){
    vec3 N = normalize(wNrm);
    vec3 L = normalize(u_lightPos - wPos);
    vec3 V = normalize(u_cameraPos - wPos);
    vec3 R = reflect(-L, N);

    float ka = 0.22; // 살짝 조정
    float kd = max(dot(N,L), 0.0);
    float ks = pow(max(dot(R,V), 0.0), 32.0);

    vec3 ambient  = ka * u_objectColor;
    vec3 diffuse  = kd * u_objectColor;
    vec3 specular = ks * vec3(1.0);

    vec3 color = (ambient + diffuse + specular) * u_lightColor;
    fragColor = vec4(color, 1.0);
}
