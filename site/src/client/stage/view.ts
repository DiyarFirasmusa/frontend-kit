import type { Layout } from '../../film/render/camera-rig.ts'
import { isShape, type ShapeName } from '../../film/shapes/index.ts'

/** What a page, or a part of one, asks of the stage. */
export interface View {
  shape: ShapeName
  /** The object it is about; -1 for the whole shape. */
  stop: number
  layout: Layout
}

export function viewOf(element: HTMLElement): View {
  const { stageShape, stageStop, stageLayout } = element.dataset
  return {
    shape: isShape(stageShape) ? stageShape : 'mark',
    stop: Number(stageStop ?? -1),
    layout: stageLayout === 'high' || stageLayout === 'far' || stageLayout === 'centre' ? stageLayout : 'side',
  }
}
