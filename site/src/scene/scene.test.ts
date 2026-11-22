import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formations, MAX_PARTS } from './formations.ts'
import { REST } from './parts.ts'
import { chapterAt, staggered } from './timeline.ts'

for (const [name, build] of Object.entries(formations)) {
  test(`${name} fits the mesh and has valid geometry at every pose`, () => {
    for (const time of [0, 0.05, 1, 7.3, 120]) {
      for (const jump of [0, 1]) {
        const { parts, width, height } = build({ ...REST, time, jump, lookX: 1, lookY: -1, focus: 3 })
        assert.ok(parts.length > 0 && parts.length <= MAX_PARTS, `${parts.length} parts`)
        assert.ok(width > 0 && height > 0)
        for (const part of parts) {
          assert.ok([...part.at, ...part.turn, part.radius].every(Number.isFinite))
          assert.ok(part.size.every((n) => n > 0))
          assert.match(part.color, /^#[0-9a-f]{6}$/)
        }
      }
    }
  })
}

test('the sprue keeps the slot and colour of every bot part', () => {
  const robot = formations.bot(REST).parts
  const runner = formations.sprue(REST).parts
  assert.deepEqual(runner.slice(0, robot.length).map((p) => p.color), robot.map((p) => p.color))
})

test('the chapter index moves from one chapter to the next', () => {
  assert.equal(chapterAt([0, 1000, 2000], 1000), 0)
  assert.equal(chapterAt([-1000, 0, 1000], 1000), 1)
  assert.equal(chapterAt([-2000, -1000, 0], 1000), 2)
})

test('a staggered move starts and ends with every part in place', () => {
  for (let i = 0; i < MAX_PARTS; i++) {
    assert.equal(staggered(0, i), 0)
    assert.equal(staggered(1, i), 1)
  }
})
