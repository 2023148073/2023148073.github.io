#version 300 es
precision highp float;

in vec3 v_fragPos;
in vec3 v_normal;
out vec4 FragColor;

struct Material { vec3 diffuse; vec3 specular; float shininess; };
struct Light { vec3 position; vec3 ambient; vec3 diffuse; vec3 specular; };

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

void main() {
    vec3 rgb = material.diffuse;
    vec3 ambient = light.ambient * rgb;

    vec3 N = normalize(v_normal);
    vec3 L = normalize(light.position - v_fragPos);
    float ndotl = max(dot(N, L), 0.0);
    vec3 diffuse = light.diffuse * ndotl * rgb;

    vec3 V = normalize(u_viewPos - v_fragPos);
    vec3 R = reflect(-L, N);
    float spec = 0.0;
    if (ndotl > 0.0) spec = pow(max(dot(V, R), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    FragColor = vec4(ambient + diffuse + specular, 1.0);
}
