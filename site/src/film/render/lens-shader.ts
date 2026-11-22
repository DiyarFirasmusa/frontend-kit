import { Vector2 } from 'three'

/** The lens: light shafts from the sun, fringing at speed, vignette, grain, letterbox and fade from black. */
export const lens = {
  uniforms: {
    tDiffuse: { value: null },
    uSunAt: { value: new Vector2(0.5, 0.5) },
    uShafts: { value: 0 },
    uSpeed: { value: 0 },
    uTime: { value: 0 },
    uOpen: { value: 0 },
    uFlash: { value: 0 },
  },
  vertexShader: /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uSunAt;
uniform float uShafts, uSpeed, uTime, uOpen, uFlash;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 off = vUv - 0.5;
  vec2 fringe = off * dot(off, off) * (0.004 + uSpeed * 0.05);
  vec3 colour = vec3(texture2D(tDiffuse, vUv + fringe).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - fringe).b);
  if (uShafts > 0.002) {
    vec2 stride = (uSunAt - vUv) / 30.0;
    vec2 at = vUv + stride * hash(gl_FragCoord.xy + uTime);
    vec3 rays = vec3(0.0);
    float fade = 1.0;
    for (int i = 0; i < 30; i++) {
      vec3 s = texture2D(tDiffuse, at).rgb;
      rays += s * max(dot(s, vec3(0.3333)) - 0.75, 0.0) * fade;
      at += stride;
      fade *= 0.955;
    }
    colour += min(rays * 0.008 * uShafts, vec3(0.16));
  }
  colour *= 1.0 - smoothstep(0.15, 0.82, dot(off, off) * 1.5) * 0.8;
  colour += uFlash * vec3(0.8, 0.45, 0.38);
  colour *= 1.0 + (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.075;
  gl_FragColor = vec4(colour * uOpen, 1.0);
}`,
}
