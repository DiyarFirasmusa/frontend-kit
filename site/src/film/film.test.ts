import assert from 'node:assert/strict'
import { test } from 'node:test'
import { STRIDE } from './shapes/blocks.ts'
import { FULL, LITE, SHAPES, type Census, type ShapeName } from './shapes/index.ts'
import { pack } from './shapes/pack.ts'
import { toClip } from './pointer.ts'
import { focusAt } from './focus.ts'
import { createTimeline, stopAt } from './timeline.ts'

const census: Census = { skills: 39, agents: 10, events: 9, ruleGroups: [10, 5, 6, 3, 2, 5] }

for (const [tier, budget] of [['full', FULL], ['lite', LITE]] as const) {
  for (const name of Object.keys(SHAPES) as ShapeName[]) {
    test(`${name} (${tier}) keeps all its meaning and packs into valid numbers`, () => {
      const shape = SHAPES[name](census, budget)
      const kept = shape.blocks.filter((b) => b.keep).length
      assert.ok(kept <= budget.blocks, `${kept} blocks must be kept, the budget is ${budget.blocks}`)
      const data = pack(shape, budget.blocks)
      assert.equal(data.length, budget.blocks * STRIDE)
      assert.ok(data.every(Number.isFinite))
      for (let i = 0; i < budget.blocks; i++) {
        assert.ok(data[i * STRIDE + 8]! > 0 && data[i * STRIDE + 9]! > 0 && data[i * STRIDE + 10]! > 0)
      }
    })
  }
}

test('labelled shapes have one anchor per label, also when the plugin grows', () => {
  for (const grown of [census, { skills: 46, agents: 12, events: 11, ruleGroups: [12, 6, 6, 3, 2, 5, 4] }]) {
    assert.equal(SHAPES.skills(grown, FULL).anchors?.length, grown.skills)
    assert.equal(SHAPES.agents(grown, FULL).anchors?.length, grown.agents)
    assert.equal(SHAPES.rules(grown, FULL).anchors?.length, grown.ruleGroups.length)
  }
})

test('the broken screen has the same pieces as the mended one', () => {
  const orders = (name: ShapeName) => SHAPES[name](census, FULL).blocks.map((b) => b.order)
  assert.deepEqual(orders('broken'), orders('screen'))
})

test('the timeline holds, reads, travels and stops at the last scene', () => {
  const timeline = createTimeline([{ hold: 1, reading: 2, travel: 1 }, { hold: 2, reading: 0, travel: 0 }])
  const at = (position: number) => timeline.at(position)
  assert.deepEqual(at(0.5), { index: 0, next: 1, hold: 0.5, read: 0, aside: 0, move: 0 })
  assert.deepEqual(at(2), { index: 0, next: 1, hold: 1, read: 0.5, aside: 1, move: 0 })
  assert.deepEqual(at(3.5), { index: 0, next: 1, hold: 1, read: 1, aside: 1, move: 0.5 })
  assert.deepEqual(at(9), { index: 1, next: 1, hold: 1, read: 0, aside: 0, move: 0 })
})

test('reading rests on every stop, in order', () => {
  const centres = [100, 400, 700]
  assert.deepEqual([0, 100, 400, 700, 900].map((middle) => stopAt(centres, middle)), [0, 0, 1, 2, 2])
  assert.equal(stopAt(centres, 250), 0.5)
  assert.equal(stopAt([], 250), -1)
})

test('every explained object can be focused', () => {
  const counts = { skills: census.skills, agents: census.agents, rules: census.ruleGroups.length, checks: census.events }
  for (const [name, amount] of Object.entries(counts) as [ShapeName, number][]) {
    const { anchors } = SHAPES[name](census, FULL)
    assert.equal(anchors?.length, amount)
    for (let stop = 0; stop < amount; stop += 0.5) {
      const focus = focusAt(name, anchors, stop)
      assert.ok(focus && [...focus.eye, ...focus.look, ...focus.at].every(Number.isFinite))
    }
  }
})

test('a pointer that moves before the stage has a size never reaches the camera', () => {
  for (const [width, height] of [[0, 0], [0, 800], [1000, 0]] as const) {
    assert.equal(toClip(180, 400, width, height), undefined)
  }
  assert.deepEqual(toClip(0, 800, 1000, 800), [-1, -1])
  assert.deepEqual(toClip(500, 400, 1000, 800), [0, 0])
})
