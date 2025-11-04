#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor;

out vec3 lightingColor;

void main(){
  vec4 wp = u_model * vec4(a_position,1.0);
  vec3 fragPos = wp.xyz;
  vec3 N = normalize(mat3(transpose(inverse(u_model))) * a_normal);
  vec3 L = normalize(u_lightPos - fragPos);
  float diff = max(dot(N,L), 0.0);

  vec3 V = normalize(u_cameraPos - fragPos);
  vec3 R = reflect(-L, N);
  float spec = pow(max(dot(V,R), 0.0), 32.0);

  vec3 rgb = u_objectColor;
  vec3 ambient = 0.2 * rgb;
  vec3 diffuse = 0.7 * diff * rgb;
  vec3 specular = 1.0 * spec * vec3(0.5);

  lightingColor = ambient + diffuse + specular;
  gl_Position = u_projection * u_view * wp;
}
