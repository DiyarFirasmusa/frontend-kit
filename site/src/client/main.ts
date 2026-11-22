import { initCopy, initCrew, initJump } from './actions.ts'
import { initCatalogue } from './catalogue.ts'
import { initChapters } from './chapters.ts'
import { initGate } from './gate.ts'
import { initMotion } from './motion.ts'
import { initProfiles } from './profiles.ts'

const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter]')]

initMotion()
initProfiles()
initGate()
initCatalogue()
initCrew()
initCopy()
initJump()
initChapters(chapters)

const root = document.documentElement
const canvas = document.querySelector<HTMLCanvasElement>('#stage')
if (canvas) {
  try {
    const { startStage } = await import('../scene/stage.ts')
    await document.fonts.ready
    startStage(canvas, chapters)
    root.classList.add('has-stage')
  } catch (error) {
    console.warn('The 3D stage could not start; showing the still posters.', error)
  }
  root.classList.remove('stage-pending')
}
