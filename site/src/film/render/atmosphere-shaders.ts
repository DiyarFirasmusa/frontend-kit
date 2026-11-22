export const sky = {
  vertexShader: /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = position;
  gl_Position = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
  gl_Position.z = gl_Position.w * 0.99999;
}`,
  fragmentShader: /* glsl */ `
uniform vec3 uBase, uLight, uSunDir;
uniform float uSun;
varying vec3 vDirection;
void main() {
  vec3 d = normalize(vDirection);
  float facing = max(dot(d, uSunDir), 0.0);
  vec3 colour = uBase * mix(0.45, 1.25, smoothstep(-0.3, 0.2, d.y) - smoothstep(0.2, 0.9, d.y) * 0.5);
  colour += uLight * uSun * (pow(facing, 9.0) * 0.045 + pow(facing, 60.0) * 0.12);
  gl_FragColor = vec4(colour, 1.0);
}`,
}

export const dust = {
  vertexShader: /* glsl */ `
attribute float seed;
uniform float uTime, uPixels;
uniform vec3 uEye;
varying float vFade;
void main() {
  vec3 p = position;
  p.y += uTime * (0.15 + seed * 0.3);
  p.x += sin(uTime * 0.2 + seed * 30.0);
  p = uEye + mod(p - uEye + 22.0, 44.0) - 22.0;
  vec4 view = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uPixels * (0.008 + seed * 0.014) / max(1.0, -view.z);
  vFade = smoothstep(1.0, 5.0, -view.z) * (1.0 - smoothstep(14.0, 22.0, -view.z));
}`,
  fragmentShader: /* glsl */ `
uniform vec3 uLight;
varying float vFade;
void main() {
  float round = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(uLight * round * vFade * 0.16, 1.0);
}`,
}
