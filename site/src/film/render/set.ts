import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  FogExp2,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  type WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GRADES } from '../direction.ts'
import type { Quality } from '../quality.ts'
import type { ShapeName } from '../shapes/index.ts'
import { mix } from '../timeline.ts'
import { dust, sky } from './atmosphere-shaders.ts'
import type { BlockMesh } from './block-mesh.ts'
import type { FilmUniforms } from './uniforms.ts'

const COLOURS = Object.fromEntries(
  Object.entries(GRADES).map(([name, g]) => [name, { base: new Color(g.base), metal: new Color(g.metal), light: new Color(g.light) }]),
) as Record<ShapeName, { base: Color; metal: Color; light: Color }>

/** Everything around the blocks: void, floor, dust and light. */
export class FilmSet {
  readonly scene = new Scene()
  private readonly key = new DirectionalLight(0xffffff, 1)
  private readonly rim = new DirectionalLight(0xffffff, 2)
  private readonly fog = new FogExp2(0x050506, 0.014)
  private readonly floor: MeshLambertMaterial
  private readonly blocks: BlockMesh
  private readonly uniforms: FilmUniforms

  constructor(renderer: WebGLRenderer, blocks: BlockMesh, uniforms: FilmUniforms, quality: Quality) {
    this.blocks = blocks
    this.uniforms = uniforms
    const { scene } = this

    const pmrem = new PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.3
    pmrem.dispose()
    scene.fog = this.fog

    this.key.position.set(-14, 22, 18)
    this.rim.position.set(9, 12, -24)
    scene.add(this.key, this.rim, blocks.mesh)

    // Dark glass: the mirrored blocks show through it.
    this.floor = new MeshLambertMaterial({ color: 0x030303, transparent: quality.reflection, opacity: quality.reflection ? 0.82 : 1 })
    const floor = new Mesh(new PlaneGeometry(400, 400), this.floor)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.04
    scene.add(floor)
    if (quality.reflection) scene.add(blocks.reflection)

    const dome = new Mesh(new SphereGeometry(100, 48, 24), new ShaderMaterial({ ...sky, uniforms, side: BackSide, depthWrite: false }))
    dome.frustumCulled = false
    scene.add(dome)

    const motes = new BufferGeometry()
    motes.setAttribute('position', new BufferAttribute(Float32Array.from({ length: quality.motes * 3 }, () => Math.random() * 44), 3))
    motes.setAttribute('seed', new BufferAttribute(Float32Array.from({ length: quality.motes }, () => Math.random()), 1))
    const haze = new Points(
      motes,
      new ShaderMaterial({ ...dust, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending }),
    )
    haze.frustumCulled = false
    scene.add(haze)
  }

  dropReflection(): void {
    this.scene.remove(this.blocks.reflection)
    this.floor.opacity = 1
  }

  /** The light and colour between two scenes. */
  light(from: ShapeName, to: ShapeName, t: number): void {
    const a = COLOURS[from]
    const b = COLOURS[to]
    const { uBase, uLight, uSun } = this.uniforms
    uBase.value.lerpColors(a.base, b.base, t)
    uLight.value.lerpColors(a.light, b.light, t)
    uSun.value = mix(GRADES[from].sun, GRADES[to].sun, t)
    this.blocks.material.color.lerpColors(a.metal, b.metal, t)
    this.fog.color.copy(uBase.value)
    this.key.intensity = mix(GRADES[from].key, GRADES[to].key, t)
    this.rim.intensity = mix(GRADES[from].rim, GRADES[to].rim, t)
    this.rim.color.copy(uLight.value)
  }
}
