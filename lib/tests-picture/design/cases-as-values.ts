/**
 * The JSON Schema documents of the cases, written by hand as values of the prototype.
 *
 * Each value is what a reader of the document's draft would build, after the canonical
 * rules. `cases-as-values.e2e.test.ts` holds each to what its document accepts.
 */

import {
  ANY,
  DOCUMENT,
  EVERY,
  NONE,
  NUMBER,
  ROOT,
  STRING,
  all,
  array,
  at,
  closed,
  fields,
  inResource,
  model,
  named,
  object,
  ofArrays,
  ofObjects,
  pattern,
  ref,
} from './build.js';
import { constantOf, exact } from './exact.js';
import type { Model, Shape } from './model.js';

const NAME = at(named('Name'));
const NODE = at(named('Node'));
const BASE = at(named('Base'));
const C = at(named('C'));
const FIELD_A = at({ step: 'field', name: 'a' });
const OTHER_C = inResource('https://example.com/other', named('c'));
const TREE = inResource('https://example.com/tree');
const SUB_C = inResource('sub/other.json', named('c'));
const A = at(named('a'));
const X = at(named('x'));
const DATA_X = at({ step: 'data', path: ['definitions', 'x'] });

const dependsOn = (key: string, then: Shape): Shape => ({
  kind: 'when',
  test: ofObjects({ required: new Set([key]) }),
  then,
});

const CLOSED_OVER_A: Shape = object({ fields: fields({ a: STRING }), rest: NONE });
const PAIR: Shape = array({ positions: [STRING, NUMBER], after: NONE, length: { least: 2n } });
const DEPENDENCIES: Shape = all(
  dependsOn('a', ofObjects({ required: new Set(['b']) })),
  dependsOn('c', ofObjects({ required: new Set(['d']) })),
);
const STRING_OR_NULL: Shape = { kind: 'by-kind', kinds: { string: 'any', null: 'any' } };
const ONLY_A: Shape = { kind: 'values', values: [constantOf('a')] };
const ONE: Shape = { kind: 'values', values: [constantOf(1)] };

/** The values, by case and by which JSON document of the case. */
export const VALUES: Readonly<Record<string, Readonly<Record<number, Model>>>> = {
  A4: {
    0: model(
      ofObjects({
        fields: fields({
          name: {
            kind: 'said',
            said: { description: 'short' },
            of: all(ref('#/$defs/Name', NAME), {
              kind: 'by-kind',
              kinds: { ...ANY, string: { length: { most: 10n } } },
            }),
          },
        }),
      }),
      [[NAME, STRING]],
    ),
    // In Draft-07 everything beside a `$ref` is ignored.
    1: model(ofObjects({ fields: fields({ name: ref('#/definitions/Name', NAME) }) }), [
      [NAME, STRING],
    ]),
  },
  A5: {
    0: model(ref('#/$defs/Node', NODE), [
      [NODE, object({ fields: fields({ next: ref('#/$defs/Node', NODE) }) })],
    ]),
  },
  A6: {
    0: model(
      ofObjects({
        fields: fields({ x: ref('#here', A), y: ref('https://example.com/other#here', OTHER_C) }),
      }),
      [
        [A, STRING, 'here'],
        [inResource('https://example.com/other'), EVERY],
        [OTHER_C, NUMBER, 'here'],
      ],
    ),
  },
  A11: {
    // `definitions` is not a keyword of 2020-12: its `x` is a schema inside other data.
    0: model(
      ofObjects({ fields: fields({ a: ref('#/$defs/x', X), b: ref('#/definitions/x', DATA_X) }) }),
      [
        [X, STRING],
        [DATA_X, NUMBER],
      ],
    ),
  },
  A21: {
    // The target of a reference is made a definition, and its own place holds an edge to it.
    0: model(
      ofObjects({
        fields: fields({
          a: ref('#/properties/a', FIELD_A),
          b: ref('#/properties/a', FIELD_A),
          self: ref('#', ROOT),
        }),
      }),
      [[FIELD_A, { kind: 'by-kind', kinds: { string: { length: { most: 2n } } } }]],
    ),
  },
  // `additionalItems` and `dependencies` are not keywords of 2020-12.
  A22: { 0: model(ofArrays({ positions: [STRING] })) },
  A23: {
    0: model(
      ofObjects({ fields: fields({ x: ref('#here', A), y: ref('sub/other.json#here', SUB_C) }) }),
      [
        [A, STRING, '#here'],
        [inResource('sub/other.json'), EVERY],
        [SUB_C, NUMBER, '#here'],
      ],
    ),
  },
  // A dialect with no vocabulary of validation: nothing in the document is read.
  A24: { 1: model(EVERY) },
  B1: {
    0: model(
      closed(all(ref('#/$defs/Base', BASE), ofObjects({ fields: fields({ extra: STRING }) }))),
      [[BASE, object({ fields: fields({ id: STRING }) })]],
    ),
  },
  B2: {
    0: model(
      closed({
        kind: 'some',
        of: [
          ofObjects({ fields: fields({ a: STRING }, ['a']) }),
          ofObjects({ fields: fields({ b: STRING }, ['b']) }),
        ],
      }),
    ),
  },
  B3: {
    0: model(
      closed(
        all(ofObjects({ fields: fields({ kind: STRING }) }), {
          kind: 'when',
          test: ofObjects({
            fields: fields({ kind: { kind: 'values', values: [constantOf('a')] } }, ['kind']),
          }),
          then: ofObjects({ fields: fields({ x: STRING }) }),
          otherwise: ofObjects({ fields: fields({ y: STRING }) }),
        }),
      ),
    ),
  },
  B4: {
    0: model({
      kind: 'rest-of',
      over: all(ofArrays({ positions: [STRING] }), ofArrays({ positions: [EVERY, NUMBER] })),
      items: NONE,
    }),
  },
  B5: {
    0: model(
      closed(ref('tree', TREE)),
      [
        [
          TREE,
          object({
            fields: fields({
              children: array({
                after: {
                  kind: 'reference-in-scope',
                  anchor: 'node',
                  edge: { written: '#node', target: { state: 'resolved', to: TREE } },
                },
              }),
            }),
          }),
        ],
      ],
      [
        { id: DOCUMENT, dynamicAnchors: new Map([['node', ROOT]]) },
        { id: TREE.resource, dynamicAnchors: new Map([['node', TREE]]) },
      ],
    ),
  },
  B6: {
    0: model(
      closed(
        all(
          object({ fields: fields({ card: STRING }) }),
          dependsOn('card', ofObjects({ fields: fields({ billing: STRING }, ['billing']) })),
        ),
      ),
    ),
  },
  // A closure round a shape that already states its rest is that shape.
  B7: { 0: model(ofObjects({ fields: fields({ a: EVERY }), rest: EVERY })) },
  B8: { 0: model(ofObjects({ fields: fields({ a: STRING }, ['a']) })) },
  B9: {
    // A closure sees only what its own schema object applies, never a sibling branch.
    0: model(all(ofObjects({ fields: fields({ a: EVERY }) }), ofObjects({ rest: NONE }))),
    1: model(all(ref('#/$defs/C', C), ofObjects({ fields: fields({ b: EVERY }) })), [
      [C, ofObjects({ fields: fields({ a: EVERY }), rest: NONE })],
    ]),
  },
  B10: {
    0: model(
      object({
        fields: fields({ id: STRING }),
        patterns: [
          { pattern: pattern('^x-'), shape: STRING },
          {
            pattern: pattern('y'),
            shape: { kind: 'by-kind', kinds: { ...ANY, string: { length: { most: 2n } } } },
          },
        ],
        rest: NONE,
      }),
    ),
  },
  B11: {
    0: model(all(object({}), { kind: 'not', of: ofObjects({ required: new Set(['a']) }) })),
    1: model(
      closed({
        kind: 'not',
        of: { kind: 'not', of: ofObjects({ fields: fields({ a: EVERY }) }) },
      }),
    ),
  },
  B12: {
    // Not folded into the array's own later items: those would not skip what `contains` matched.
    0: model({
      kind: 'rest-of',
      over: array({ contains: { shape: STRING, least: 1n } }),
      items: NUMBER,
    }),
  },
  B13: {
    0: model(closed({ kind: 'when', test: ofObjects({ fields: fields({ a: STRING }) }) })),
  },
  B14: {
    0: model(
      closed({
        kind: 'one',
        of: [
          ofObjects({ fields: fields({ a: STRING }, ['a']) }),
          ofObjects({ fields: fields({ b: STRING }, ['b']) }),
        ],
      }),
    ),
  },
  C2: { 0: model(object({ fields: fields({ a: STRING }) })) },
  D1: {
    0: model({
      kind: 'said',
      said: { default: constantOf('x') },
      of: { kind: 'by-kind', kinds: { string: { length: { least: 5n } } } },
    }),
  },
  E1: {
    0: model({
      kind: 'by-kind',
      kinds: {
        number: {
          least: { value: exact(0n), exclusive: false },
          most: { value: exact(18446744073709551615n), exclusive: false },
          multipleOf: exact(1n, -2),
        },
      },
    }),
  },
  E2: { 0: model(ONE), 1: model(ONE) },
  E3: {
    0: model(ofObjects({ fields: fields({ anything: EVERY, nothing: NONE }, ['anything']) })),
  },
  E4: { 0: model(all(STRING, { kind: 'values', values: [constantOf(5)] })) },
  E5: {
    0: model({
      kind: 'by-kind',
      kinds: { number: { whole: true, format: { name: 'int64', asserted: false } } },
    }),
  },
  H1: {
    0: model(
      object({ fields: fields({ a: all(STRING, { kind: 'values', values: [constantOf(5)] }) }) }),
    ),
  },
  I1: { 0: model(CLOSED_OVER_A), 1: model(CLOSED_OVER_A) },
  I2: { 0: model(PAIR), 1: model(PAIR) },
  I3: { 0: model(DEPENDENCIES), 1: model(DEPENDENCIES) },
  I4: { 0: model(STRING_OR_NULL), 1: model(STRING_OR_NULL) },
  I5: { 0: model(ONLY_A), 1: model(ONLY_A) },
  I6: { 0: model(EVERY), 1: model(EVERY) },
};
