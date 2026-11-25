import { describe, expect, it } from 'vitest';
import { makeLocation } from '../../../warehouse-test-utils';
import {
  buildLocationTree,
  countDescendants,
  type LocationTreeNode,
} from './location-tree';

function flatten(nodes: LocationTreeNode[]): string[] {
  return nodes.flatMap((node) => [node.location.id, ...flatten(node.children)]);
}

describe('buildLocationTree', () => {
  it('returns an empty tree for no locations', () => {
    expect(buildLocationTree([])).toEqual([]);
  });

  it('treats null and unknown parents as roots', () => {
    const roots = buildLocationTree([
      makeLocation({ id: 'a', code: 'A', parentId: null }),
      makeLocation({ id: 'b', code: 'B', parentId: 'missing' }),
    ]);

    expect(roots.map((node) => node.location.id)).toEqual(['a', 'b']);
  });

  it('groups children under their parent', () => {
    const tree = buildLocationTree([
      makeLocation({ id: 'zone', code: 'ZONE-A', parentId: null }),
      makeLocation({ id: 'rack-1', code: 'R1', parentId: 'zone' }),
      makeLocation({ id: 'rack-2', code: 'R2', parentId: 'zone' }),
      makeLocation({ id: 'shelf', code: 'S1', parentId: 'rack-1' }),
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children.map((n) => n.location.id)).toEqual([
      'rack-1',
      'rack-2',
    ]);
    expect(tree[0].children[0].children.map((n) => n.location.id)).toEqual([
      'shelf',
    ]);
  });

  it('sorts siblings by code with numeric ordering', () => {
    const tree = buildLocationTree([
      makeLocation({ id: 'p', code: 'P', parentId: null }),
      makeLocation({ id: 'c10', code: 'C10', parentId: 'p' }),
      makeLocation({ id: 'c2', code: 'C2', parentId: 'p' }),
      makeLocation({ id: 'c1', code: 'C1', parentId: 'p' }),
    ]);

    expect(tree[0].children.map((n) => n.location.code)).toEqual([
      'C1',
      'C2',
      'C10',
    ]);
  });

  it('does not loop forever on a cycle and keeps every location visible', () => {
    const tree = buildLocationTree([
      makeLocation({ id: 'root', code: 'ROOT', parentId: null }),
      makeLocation({ id: 'a', code: 'A', parentId: 'b' }),
      makeLocation({ id: 'b', code: 'B', parentId: 'a' }),
      makeLocation({ id: 'self', code: 'SELF', parentId: 'self' }),
    ]);

    expect(flatten(tree).toSorted()).toEqual(['a', 'b', 'root', 'self']);
    expect(tree.map((n) => n.location.id)).toEqual(['a', 'root', 'self']);
  });
});

describe('countDescendants', () => {
  it('counts every location below a node at any depth', () => {
    const [zone] = buildLocationTree([
      makeLocation({ id: 'zone', code: 'Z' }),
      makeLocation({ id: 'rack', code: 'R', parentId: 'zone' }),
      makeLocation({ id: 'bin', code: 'B', parentId: 'rack' }),
      makeLocation({ id: 'bin2', code: 'B2', parentId: 'rack' }),
    ]);
    expect(zone ? countDescendants(zone) : -1).toBe(3);
  });

  it('returns 0 for a leaf', () => {
    const [leaf] = buildLocationTree([makeLocation({ id: 'x', code: 'X' })]);
    expect(leaf ? countDescendants(leaf) : -1).toBe(0);
  });
});
