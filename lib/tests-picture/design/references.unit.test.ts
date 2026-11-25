/**
 * References of the prototype: one identity for each definition by where it is, and a
 * reference in scope resolved through the resources entered.
 */

import { describe, it, expect } from 'vitest';

import type { JsonValue } from '../refusals/judge.js';

import {
  DOCUMENT,
  NUMBER,
  ROOT,
  STRING,
  at,
  closed,
  fields,
  inResource,
  model,
  named,
  object,
  ofObjects,
  ref,
} from './build.js';
import { asStated } from './evaluate.js';
import type { DefinitionId, Model, Shape } from './model.js';

function accepts(value: Model, instance: JsonValue): boolean {
  return asStated(value, { present: true, value: instance }).accepted;
}

function inScope(anchor: string, to: DefinitionId): Shape {
  return {
    kind: 'reference-in-scope',
    anchor,
    edge: { target: { state: 'resolved', to } },
  };
}

describe('the identity of a definition', () => {
  it('tells apart two definitions of one name, one inside the other', () => {
    const OUTER = at(named('A'));
    const INNER = at(named('A'), named('A'));
    const nested = model(
      ofObjects({
        fields: fields({ x: ref(OUTER), y: ref(INNER) }),
      }),
      [
        [OUTER, STRING],
        [INNER, NUMBER],
      ],
    );

    expect(accepts(nested, { x: 's', y: 1 })).toBe(true);
    expect(accepts(nested, { y: 's' })).toBe(false);
    expect(accepts(nested, { x: 1 })).toBe(false);
  });
});

describe('how a reference was spelt', () => {
  it('is in the record, so two spellings of one reference are one value', () => {
    const A = at(named('a'));
    const shape = ofObjects({ fields: fields({ x: ref(A) }) });
    const spelt = (as: string): Model => ({
      ...model(shape, [[A, STRING, 'here']]),
      record: { written: [{ in: ROOT, to: A, as }] },
    });
    const byAnchor = spelt('#here');
    const byPointer = spelt('#/$defs/a');

    expect(byAnchor.definitions).toEqual(byPointer.definitions);
    expect(byAnchor.record).not.toEqual(byPointer.record);
  });
});

describe('a reference in scope', () => {
  const TREE = inResource('tree');
  const tree: Shape = object({ fields: fields({ child: inScope('node', TREE) }) });

  it('is not captured by a name that is not a dynamic anchor', () => {
    // The root names itself `node` as a plain alias and is closed; the tree is not.
    const plain: Model = {
      entry: ROOT,
      definitions: [
        { id: ROOT, aliases: ['node'], shape: closed(ref(TREE)) },
        { id: TREE, aliases: [], shape: tree },
      ],
      resources: [
        { id: DOCUMENT, dynamicAnchors: new Map() },
        { id: TREE.resource, dynamicAnchors: new Map([['node', TREE]]) },
      ],
      record: { written: [] },
    };

    expect(accepts(plain, { child: { extra: 1 } })).toBe(true);
    expect(accepts(plain, { extra: 1 })).toBe(false);
  });

  it('resolves to the outermost resource entered that declares the anchor', () => {
    // The document holds a resource of its own, which declares the anchor and is closed.
    const STRICT = inResource('strict');
    const through = model(
      ofObjects({ fields: fields({ data: ref(STRICT) }) }),
      [
        [STRICT, closed(ref(TREE))],
        [TREE, tree],
      ],
      [
        { id: DOCUMENT, dynamicAnchors: new Map() },
        { id: STRICT.resource, dynamicAnchors: new Map([['node', STRICT]]) },
        { id: TREE.resource, dynamicAnchors: new Map([['node', TREE]]) },
      ],
    );

    expect(accepts(through, { data: { child: { child: {} } } })).toBe(true);
    expect(accepts(through, { data: { child: { extra: 1 } } })).toBe(false);
  });
});
