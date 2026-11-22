import type { IUniform, MeshStandardMaterial } from 'three'
import { CENTRE } from '../shapes/blocks.ts'

const ROTATE = /* glsl */ `
vec3 turn(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
vec4 compose(vec4 a, vec4 b) { return vec4(a.w * b.xyz + b.w * a.xyz + cross(a.xyz, b.xyz), a.w * b.w - dot(a.xyz, b.xyz)); }
vec4 around(vec3 axis, float angle) { return vec4(axis * sin(angle * 0.5), cos(angle * 0.5)); }
`

/** Turns a standard metal material into one that morphs between two scenes on the GPU. */
export function makeFilmMaterial(material: MeshStandardMaterial, uniforms: Record<string, IUniform>): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */ `#include <common>
attribute vec4 aPos, bPos, aRot, bRot, aSize, bSize;
attribute float seed;
uniform float uT, uTime, uBlast, uSwirl, uShock, uTumble;
uniform vec3 uRay, uEye, uFocus, uReach;
uniform float uTouch, uBurst;
varying float vGlow;
varying float vHeat;
varying float vEdge;
varying float vHeight;
varying float vSweep;
varying float vNear;
${ROTATE}
vec3 orbit(vec4 p, vec4 r, float spin, vec3 centre, out vec4 q) {
  if (spin == 0.0) { q = r; return p.xyz; }
  vec4 s = around(normalize(turn(r, vec3(0.0, 0.0, 1.0))), spin * uTime);
  q = compose(s, r);
  return centre + turn(s, p.xyz - centre);
}`)
      .replace('#include <beginnormal_vertex>', /* glsl */ `
float delay = fract(seed * 0.71 + float(gl_InstanceID) * 0.00002) * 0.5;
float t = clamp(uT * 1.5 - delay, 0.0, 1.0);
float ease = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
float air = sin(3.14159265 * t);
vec4 qa, qb;
vec3 pa = orbit(aPos, aRot, aSize.w, vec3(0.0, ${CENTRE.toFixed(1)}, 0.0), qa);
vec3 pb = orbit(bPos, bRot, bSize.w, vec3(0.0, ${CENTRE.toFixed(1)}, 0.0), qb);
if (dot(qa, qb) < 0.0) qb = -qb;
vec4 q = normalize(mix(qa, qb, ease));
vec3 axis = normalize(vec3(sin(seed * 41.0), cos(seed * 23.0) + 0.2, sin(seed * 67.0) + 0.1));
q = compose(around(axis, ease * 6.2831853 * (1.0 + floor(seed * 2.0)) * uTumble), q);
vec3 centre = mix(pa, pb, ease);
vec3 whirl = cross(vec3(0.0, 1.0, 0.0), centre - vec3(0.0, 8.0, 0.0));
centre += whirl * air * uSwirl * (0.35 + seed * 0.45);
centre.y += air * uSwirl * 4.0 * (seed - 0.25);
vec3 outward = normalize(centre - vec3(0.0, 3.0, 0.0) + axis * 2.0);
centre += outward * air * uBlast * (5.0 + seed * 22.0);
centre += axis * air * (0.12 + uTumble * 0.8);
float ring = exp(-pow((length(centre.xz) - uShock * 46.0) * 0.28, 2.0)) * step(0.001, uShock) * (1.0 - uShock);
centre.y += ring * 2.2;
vec3 toBlock = centre - uEye;
vec3 away = toBlock - uRay * dot(toBlock, uRay);
float near = exp(-dot(away, away) * 0.2) * uTouch;
centre += normalize(away + axis * 0.02) * near * 1.1;
q = compose(around(axis, near * 1.4), q);
centre += (outward * (2.0 + seed * 9.0) + axis * 3.0) * uBurst;
q = compose(around(axis, uBurst * (2.0 + seed * 5.0)), q);
centre.z += sin(length(centre.xy - vec2(0.0, 10.0)) * 0.85 - uTime * 2.1) * 0.11;
centre.y += sin(uTime * 0.7 + centre.x * 0.2 + centre.z * 0.17) * 0.035;
vec3 objectNormal = turn(q, normal);
vGlow = mix(aPos.w, bPos.w, ease);
if (vGlow > 0.0) vGlow *= 0.82 + 0.3 * sin(uTime * 2.6 - (centre.x + centre.y) * 0.45);
vHeat = air * air * air * air * step(0.95, fract(seed * 13.7)) + ring * 0.7 + near * 0.35 + uBurst * step(0.8, seed) * 0.6;
vEdge = 1.0 - max(abs(normal.x), max(abs(normal.y), abs(normal.z)));
vec3 fromFocus = (centre - uFocus) / uReach;
vNear = 1.0 - smoothstep(0.9, 1.25, length(fromFocus));
vHeight = centre.y;
vSweep = exp(-pow((centre.x + centre.y * 0.45 - (mod(uTime * 11.0, 80.0) - 30.0)) * 0.55, 2.0));`)
      .replace('#include <begin_vertex>', /* glsl */ `
vec3 halfSize = mix(aSize.xyz, bSize.xyz, ease) * 0.5;
float lip = min(0.07, min(halfSize.x, min(halfSize.y, halfSize.z)) * 0.32);
vec3 transformed = centre + turn(q, sign(position) * (halfSize - lip) + normal * lip);`)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */ `#include <common>
uniform vec3 uLight;
uniform float uFocusOn;
varying float vNear;
varying float vGlow;
varying float vHeat;
varying float vEdge;
varying float vHeight;
varying float vSweep;`)
      .replace('#include <color_fragment>', /* glsl */ `#include <color_fragment>
diffuseColor.rgb *= mix(0.45, 1.0, smoothstep(-1.0, 6.0, vHeight)) * (1.0 + min(vGlow, 0.0) * 0.95) * mix(1.0, 0.3 + vNear * 1.3, uFocusOn);`)
      .replace('#include <emissivemap_fragment>', /* glsl */ `#include <emissivemap_fragment>
totalEmissiveRadiance += uLight * mix(1.0, 0.25 + vNear, uFocusOn) * (max(vGlow, 0.0) * 1.75 + vNear * uFocusOn * (0.035 + vEdge * 0.75) + vHeat * (0.2 + vEdge * 3.5) + vEdge * (0.012 + vSweep * 1.4) + vSweep * 0.025);`)
  }
}
