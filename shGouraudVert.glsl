#version 300 es
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec4 a_color;
layout(location = 3) in vec2 a_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

struct Material { vec3 diffuse; vec3 specular; float shininess; };
struct Light { vec3 position; vec3 ambient; vec3 diffuse; vec3 specular; };

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

out vec3 v_lightingColor;

void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    vec3 fragPos  = worldPos.xyz;
    vec3 normal   = mat3(transpose(inverse(u_model))) * a_normal;

    vec3 rgb = material.diffuse;
    vec3 ambient = light.ambient * rgb;

    vec3 N = normalize(normal);
    vec3 L = normalize(light.position - fragPos);
    float ndotl = max(dot(N, L), 0.0);
    vec3 diffuse = light.diffuse * ndotl * rgb;

    vec3 V = normalize(u_viewPos - fragPos);
    vec3 R = reflect(-L, N);
    float spec = 0.0;
    if (ndotl > 0.0) spec = pow(max(dot(V, R), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    v_lightingColor = ambient + diffuse + specular;
    gl_Position = u_projection * u_view * worldPos;
}
