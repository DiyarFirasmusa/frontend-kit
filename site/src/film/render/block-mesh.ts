import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  MeshStandardMaterial,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { STRIDE } from '../shapes/blocks.ts'
import type { BuiltShapes, ShapeName } from '../shapes/index.ts'
import { makeFilmMaterial } from './block-material.ts'
import type { FilmUniforms } from './uniforms.ts'

/** All blocks in one draw call, holding the shape they leave and the shape they fly to. */
export class BlockMesh {
  readonly material = new MeshStandardMaterial({ metalness: 0.88, roughness: 0.3 })
  readonly mesh: Mesh
  readonly reflection: Mesh
  private readonly from: InstancedInterleavedBuffer
  private readonly to: InstancedInterleavedBuffer
  private readonly blocksOf: BuiltShapes['blocksOf']
  private loaded = ''

  constructor(count: number, blocksOf: BuiltShapes['blocksOf'], uniforms: FilmUniforms) {
    this.blocksOf = blocksOf
    this.from = new InstancedInterleavedBuffer(new Float32Array(count * STRIDE), STRIDE)
    this.to = new InstancedInterleavedBuffer(new Float32Array(count * STRIDE), STRIDE)

    const box = new RoundedBoxGeometry(1, 1, 1, 1, 0.12)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', box.getAttribute('position'))
    geometry.setAttribute('normal', box.getAttribute('normal'))
    if (box.index) geometry.setIndex(box.index)
    geometry.instanceCount = count

    for (const [prefix, buffer] of [['a', this.from], ['b', this.to]] as const) {
      geometry.setAttribute(`${prefix}Pos`, new InterleavedBufferAttribute(buffer, 4, 0))
      geometry.setAttribute(`${prefix}Rot`, new InterleavedBufferAttribute(buffer, 4, 4))
      geometry.setAttribute(`${prefix}Size`, new InterleavedBufferAttribute(buffer, 4, 8))
    }
    const seeds = Float32Array.from({ length: count }, (_, i) => (i * 0.618034) % 1)
    geometry.setAttribute('seed', new InstancedBufferAttribute(seeds, 1))

    makeFilmMaterial(this.material, uniforms)
    this.mesh = new Mesh(geometry, this.material)
    // The shader places the blocks, so the geometry's own bounds say nothing.
    this.mesh.frustumCulled = false
    this.reflection = new Mesh(geometry, this.material)
    this.reflection.scale.y = -1
    this.reflection.frustumCulled = false
  }

  load(from: ShapeName, to: ShapeName): void {
    if (this.loaded === from + to) return
    this.loaded = from + to
    this.from.array.set(this.blocksOf(from))
    this.to.array.set(this.blocksOf(to))
    this.from.needsUpdate = true
    this.to.needsUpdate = true
  }
}
