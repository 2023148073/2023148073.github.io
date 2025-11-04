#version 300 es
precision highp float;
in vec3 fragPos;
in vec3 normal;
out vec4 FragColor;

uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor;

void main(){
  vec3 rgb = u_objectColor;
  vec3 ambient = 0.2 * rgb;

  vec3 N = normalize(normal);
  vec3 L = normalize(u_lightPos - fragPos);
  float diff = max(dot(N,L), 0.0);
  vec3 diffuse = 0.7 * diff * rgb;

  vec3 V = normalize(u_cameraPos - fragPos);
  vec3 R = reflect(-L, N);
  float spec = pow(max(dot(V,R), 0.0), 32.0);
  vec3 specular = 1.0 * spec * vec3(0.5);

  FragColor = vec4(ambient + diffuse + specular, 1.0);
}
