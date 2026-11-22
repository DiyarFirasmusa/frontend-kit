import assert from 'node:assert/strict'
import { test } from 'node:test'
import { STRIDE } from './shapes/blocks.ts'
import { FULL, LITE, SHAPES, type Census, type ShapeName } from './shapes/index.ts'
import { pack } from './shapes/pack.ts'
import { createTimeline } from './timeline.ts'

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

test('the timeline holds, travels and stops at the last scene', () => {
  const timeline = createTimeline([{ hold: 1, travel: 1 }, { hold: 2, travel: 0 }])
  assert.deepEqual(timeline.at(0.5), { index: 0, next: 1, hold: 0.5, move: 0 })
  assert.deepEqual(timeline.at(1.5), { index: 0, next: 1, hold: 1, move: 0.5 })
  assert.deepEqual(timeline.at(9), { index: 1, next: 1, hold: 1, move: 0 })
})
