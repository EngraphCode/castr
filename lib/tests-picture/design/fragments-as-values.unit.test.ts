/**
 * OpenAPI fragments of the cases as values of the boundary half: that each holds
 * together, and that what a writer reads from it is what the fragment says.
 */

import { isDeepStrictEqual } from 'node:util';

import { describe, it, expect } from 'vitest';

import { isJsonObject } from '../rows/json.js';

import { boundariesOf, parametersInForce, securityInForce } from './boundaries.js';
import type { Boundaries } from './boundary.js';
import { A14, F1, F2, F4, F6, F7, F8, F9, G4 } from './fragments-as-values.js';
import type { DefinitionId } from './model.js';

const VALUES: Readonly<Record<string, Boundaries>> = { A14, F1, F2, F4, F6, F7, F8, F9, G4 };

/** Every identity a resolved edge anywhere in a value points at. */
function targets(value: unknown): readonly unknown[] {
  if (value instanceof Map) {
    return [...value.values()].flatMap((member) => targets(member));
  }
  if (Array.isArray(value)) {
    return value.flatMap((member: unknown) => targets(member));
  }
  if (!isJsonObject(value)) {
    return [];
  }
  const own = value['state'] === 'resolved' ? [value['to']] : [];
  return [...own, ...Object.values(value).flatMap((member) => targets(member))];
}

function dangling(model: Boundaries): readonly unknown[] {
  const known = model.parts.map((part): DefinitionId => part.id);
  return targets(model).filter((target) => !known.some((id) => isDeepStrictEqual(id, target)));
}

describe('the fragments as values', () => {
  it.each(Object.entries(VALUES))(
    '%s: every edge reaches a part, and no part has two identities',
    (_, model) => {
      expect(dangling(model)).toEqual([]);
      expect(
        model.parts.filter((one) =>
          model.parts.some((other) => other !== one && isDeepStrictEqual(other.id, one.id)),
        ),
      ).toEqual([]);
    },
  );

  it('F2 holds a parameter in each place, by a shape or by a media type', () => {
    const [get] = boundariesOf(F2);
    const inForce = get === undefined ? [] : parametersInForce(F2, get);

    expect(inForce.map((one) => [one.name, one.location, one.required, one.carried.by])).toEqual([
      ['id', 'path', true, 'shape'],
      ['q', 'query', false, 'shape'],
      ['X-Trace', 'header', false, 'shape'],
      ['session', 'cookie', false, 'shape'],
      ['filter', 'query', false, 'media'],
    ]);
  });

  it('F2 fills the style its place gives a parameter that states none', () => {
    const [get] = boundariesOf(F2);
    const styles = (get === undefined ? [] : parametersInForce(F2, get)).flatMap((one) =>
      one.carried.by === 'shape'
        ? [[one.name, one.carried.styled.style, one.carried.styled.explode]]
        : [],
    );

    expect(styles).toEqual([
      ['id', 'simple', false],
      ['q', 'deepObject', true],
      ['X-Trace', 'simple', false],
      ['session', 'form', true],
    ]);
  });

  it('F6 holds a method the formats name and one they do not, as it is sent', () => {
    expect(boundariesOf(F6).map((one) => one.method)).toEqual([
      { method: 'query' },
      { method: 'other', token: 'PURGE' },
    ]);
  });

  it('F7 holds a webhook apart from the paths, and a callback beside neither', () => {
    expect(boundariesOf(F7).map((one) => one.path)).toEqual([
      [{ part: 'text', text: '/subscribe' }],
    ]);
    expect([...F7.api.webhooks.keys()]).toEqual(['newPet']);
    expect(F7.parts.filter((one) => one.part.part === 'callback')).toHaveLength(1);
  });

  it('F4 and F8 and F9 each have one boundary', () => {
    expect([F4, F8, F9].map((model) => boundariesOf(model).length)).toEqual([1, 1, 1]);
  });

  it('A14 has two boundaries with one operation, which a link reaches by its name', () => {
    const found = boundariesOf(A14);

    expect(found).toHaveLength(2);
    expect(found[0]?.operation).toEqual(found[1]?.operation);
  });

  it('F1 holds a path with nothing at it, and lets an operation replace its path’s parameter', () => {
    const [get, remove] = boundariesOf(F1);
    const shapes = [get, remove].map((one) =>
      one === undefined ? [] : parametersInForce(F1, one).map((parameter) => parameter.carried),
    );

    expect(F1.api.paths).toHaveLength(2);
    expect(shapes.map((carried) => carried.length)).toEqual([1, 1]);
    expect(shapes[0]).not.toEqual(shapes[1]);
  });

  it('G4 tells none needed, anything accepted, and two schemes needed together', () => {
    const inForce = boundariesOf(G4).map((one) => securityInForce(G4, one));

    expect(inForce.map((security) => security.map((requirement) => requirement.length))).toEqual([
      [],
      [0],
      [2],
    ]);
  });
});
