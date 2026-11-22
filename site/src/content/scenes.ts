import type { Layout } from '../film/render/camera-rig.ts'
import type { ShapeName } from '../film/shapes/index.ts'
export interface Scene {
  id: SceneId
  shape: ShapeName
  layout: Layout
  /** Screens of scroll it holds still, and the screens its flight to the next takes. */
  hold: number
  travel: number
}

export type SceneId =
  | 'intro'
  | 'without'
  | 'with'
  | 'how'
  | 'website'
  | 'dashboard'
  | 'both'
  | 'skills'
  | 'agents'
  | 'rules'
  | 'checks'
  | 'guards'
  | 'features'
  | 'rescue'
  | 'examples'
  | 'questions'
  | 'install'

/** The film's edit. A scene's explanation scrolls between its hold and its travel. */
export const scenes: Scene[] = [
  { id: 'intro', shape: 'mark', layout: 'side', hold: 0.7, travel: 1 },
  { id: 'without', shape: 'broken', layout: 'side', hold: 1, travel: 1.1 },
  { id: 'with', shape: 'screen', layout: 'side', hold: 1, travel: 1 },
  { id: 'how', shape: 'layers', layout: 'side', hold: 1.4, travel: 1 },
  { id: 'website', shape: 'website', layout: 'side', hold: 0.7, travel: 0.8 },
  { id: 'dashboard', shape: 'dashboard', layout: 'side', hold: 0.7, travel: 0.8 },
  { id: 'both', shape: 'both', layout: 'side', hold: 0.7, travel: 1 },
  { id: 'skills', shape: 'skills', layout: 'high', hold: 1.7, travel: 1 },
  { id: 'agents', shape: 'agents', layout: 'high', hold: 1.3, travel: 1 },
  { id: 'rules', shape: 'rules', layout: 'high', hold: 1.1, travel: 1 },
  { id: 'checks', shape: 'checks', layout: 'side', hold: 2.6, travel: 1 },
  { id: 'guards', shape: 'gate', layout: 'side', hold: 1.7, travel: 1.1 },
  { id: 'features', shape: 'screen', layout: 'side', hold: 0.5, travel: 0.8 },
  { id: 'rescue', shape: 'broken', layout: 'side', hold: 0.6, travel: 0.8 },
  { id: 'examples', shape: 'website', layout: 'side', hold: 0.5, travel: 0.8 },
  { id: 'questions', shape: 'layers', layout: 'side', hold: 0.5, travel: 1 },
  { id: 'install', shape: 'mark', layout: 'side', hold: 1.2, travel: 0 },
]
