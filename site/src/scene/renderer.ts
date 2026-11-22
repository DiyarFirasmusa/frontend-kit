import {
  DirectionalLight,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { MAX_PARTS } from './formations.ts'
import { applyMouldedShape, mouldedGeometry } from './moulded-geometry.ts'
import type { Placed, Target } from './placed.ts'

const CAMERA_DISTANCE = 30
const FIELD_OF_VIEW = 24
const VIEW_HEIGHT = 2 * CAMERA_DISTANCE * Math.tan((FIELD_OF_VIEW * Math.PI) / 360)
const MAX_PIXEL_RATIO = 1.75
const ONE = new Vector3(1, 1, 1)

/** Draws every part of the kit in one instanced draw call. */
export class KitRenderer {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 1, 80)
  private readonly mesh: InstancedMesh
  private readonly shapes = new InstancedBufferAttribute(new Float32Array(MAX_PARTS * 4), 4)
  private readonly bevels = new InstancedBufferAttribute(new Float32Array(MAX_PARTS), 1)
  private readonly matrix = new Matrix4()
  private width = 1
  private height = 1
  private pixelRatio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO)

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    this.renderer.toneMapping = NeutralToneMapping

    const pmrem = new PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.5
    pmrem.dispose()

    const key = new DirectionalLight('#fff6e8', 2.1)
    key.position.set(-5, 8, 10)
    const rim = new DirectionalLight('#b9c8ff', 1.3)
    rim.position.set(7, 2, -3)
    this.scene.add(key, rim, new HemisphereLight('#ffffff', '#8877aa', 0.65))

    const material = new MeshPhysicalMaterial({ roughness: 0.36, clearcoat: 0.8, clearcoatRoughness: 0.16 })
    applyMouldedShape(material)

    const geometry = mouldedGeometry()
    geometry.setAttribute('shape', this.shapes)
    geometry.setAttribute('bevel', this.bevels)
    this.mesh = new InstancedMesh(geometry, material, MAX_PARTS)
    // The shader moves the vertices, so the geometry's own bounds say nothing.
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)

    this.camera.position.z = CAMERA_DISTANCE
    this.renderer.setPixelRatio(this.pixelRatio)
  }

  resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return
    this.width = width
    this.height = height
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  lowerQuality(): void {
    if (this.pixelRatio <= 1) return
    this.pixelRatio = 1
    this.renderer.setPixelRatio(1)
  }

  /** Converts a box in CSS pixels to world units on the plane the kit sits on. */
  toWorld(rect: { left: number; top: number; width: number; height: number }): Target {
    const unit = VIEW_HEIGHT / this.height
    return {
      x: (rect.left + rect.width / 2 - this.width / 2) * unit,
      y: -(rect.top + rect.height / 2 - this.height / 2) * unit,
      width: rect.width * unit,
      height: rect.height * unit,
    }
  }

  draw(parts: readonly Placed[]): void {
    parts.forEach((part, i) => {
      this.mesh.setMatrixAt(i, this.matrix.compose(part.position, part.rotation, ONE))
      this.mesh.setColorAt(i, part.color)
      this.shapes.setXYZW(i, part.shape.x, part.shape.y, part.shape.z, part.shape.w)
      this.bevels.setX(i, part.bevel)
    })
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
    this.shapes.needsUpdate = true
    this.bevels.needsUpdate = true
    this.renderer.render(this.scene, this.camera)
  }
}
