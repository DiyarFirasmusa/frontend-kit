import { BufferAttribute, BufferGeometry, type MeshPhysicalMaterial } from 'three'

const CORNER_STEPS = 7
const BEVEL_STEPS = 4
const CORNERS = [[1, 1], [-1, 1], [-1, -1], [1, -1]] as const

/**
 * A rounded, bevelled box whose size, radius and bevel are per-instance values resolved in the vertex
 * shader. That lets one draw call morph a pill into a panel without stretching its corners.
 *
 * `position` holds the corner signs and the face side; `profile` holds the outward direction around
 * the outline and around the bevel.
 */
export function mouldedGeometry(): BufferGeometry {
  const position: number[] = []
  const profile: number[] = []
  const index: number[] = []
  const ringSize = CORNERS.length * (CORNER_STEPS + 1)

  for (const side of [1, -1]) {
    for (let step = 0; step <= BEVEL_STEPS; step++) {
      const bend = ((side > 0 ? 1 - step / BEVEL_STEPS : -step / BEVEL_STEPS) * Math.PI) / 2
      CORNERS.forEach(([sx, sy], corner) => {
        for (let i = 0; i <= CORNER_STEPS; i++) {
          const around = ((corner + i / CORNER_STEPS) * Math.PI) / 2
          position.push(sx, sy, side)
          profile.push(Math.cos(around), Math.sin(around), Math.cos(bend), Math.sin(bend))
        }
      })
    }
  }

  const rings = (BEVEL_STEPS + 1) * 2
  for (let ring = 0; ring < rings - 1; ring++) {
    for (let i = 0; i < ringSize; i++) {
      const a = ring * ringSize + i
      const d = ring * ringSize + ((i + 1) % ringSize)
      index.push(a, a + ringSize, d + ringSize, a, d + ringSize, d)
    }
  }

  const front = rings * ringSize
  const back = front + 1
  position.push(0, 0, 1, 0, 0, -1)
  profile.push(0, 0, 0, 1, 0, 0, 0, -1)
  const last = (rings - 1) * ringSize
  for (let i = 0; i < ringSize; i++) {
    const next = (i + 1) % ringSize
    index.push(front, i, next, back, last + next, last + i)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3))
  geometry.setAttribute('profile', new BufferAttribute(new Float32Array(profile), 4))
  geometry.setIndex(index)
  return geometry
}

export function applyMouldedShape(material: MeshPhysicalMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 profile;\nattribute vec4 shape;\nattribute float bevel;')
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(profile.xy * profile.z, profile.w);')
      .replace(
        '#include <begin_vertex>',
        `float corner = min(shape.w, min(shape.x, shape.y));
        float lip = min(bevel, min(corner, shape.z));
        vec3 transformed = vec3(
          position.xy * (shape.xy - corner) + profile.xy * (corner - lip + lip * profile.z),
          position.z * (shape.z - lip) + lip * profile.w
        );`,
      )
  }
}
