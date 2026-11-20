/**
 * The picture's rows, read from the pinned definitions and joined to their proposals.
 *
 * This test reads the pinned files from the repository, so it is an end-to-end test. It
 * holds the facts that make the row list whole: nothing computed lacks a proposal,
 * nothing proposed is uncomputed, and the bars on the fifth class and on `read` hold.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from './definitions.js';
import { pictureRows } from './picture-rows.js';
import type { Row } from './table.js';

describe('the picture rows', () => {
  const { rows, problems } = pictureRows(loadDefinition);

  function rowWith(id: string): Row {
    const found = rows.find((candidate) => candidate.id === id);
    if (found === undefined) {
      throw new Error(`no row ${id}`);
    }
    return found;
  }

  it('has a proposal for every computed row, a row for every proposal, and no broken bar', () => {
    expect(problems).toEqual([]);
  });

  it('holds the rows of every part of a document', () => {
    const count = (group: Row['group']): number => rows.filter((row) => row.group === group).length;

    expect(count('schema keyword')).toBe(57);
    expect(count('type value')).toBe(7);
    expect(count('format value')).toBe(25);
    expect(count('schema construct')).toBe(6);
    expect(count('schema vocabulary')).toBe(20);
    expect(count('document')).toBe(201);
  });

  it('marks the rows only OpenAPI 3.2 declares', () => {
    expect(rowWith('parameter.in=querystring').versions).toEqual(['3.2']);
    expect(rowWith('path-item.query').versions).toEqual(['3.2']);
    expect(rowWith('discriminator.defaultMapping').versions).toEqual(['3.2']);
    expect(rowWith('xml.nodeType=cdata').versions).toEqual(['3.2']);
    expect(rowWith('parameter.in=query').versions).toEqual(['3.1', '3.2']);
  });

  it('proposes no part of a schema as unexpressible or outside a target', () => {
    const schemaRows = rows.filter((row) => row.group !== 'document');
    const outcomes = schemaRows.flatMap((row) => [
      row.proposal.zod,
      row.proposal.typescript,
      row.proposal.endpoints,
    ]);

    expect(outcomes).not.toContain('unexpressible');
    expect(outcomes).not.toContain('outside the target');
  });

  it('proposes a serialisation rule as held by the endpoint definitions', () => {
    for (const id of ['parameter.style=deepObject', 'parameter.explode', 'media-type.encoding']) {
      expect(rowWith(id).proposal).toMatchObject({
        zod: 'outside the target',
        typescript: 'outside the target',
        endpoints: 'carried as structure',
      });
    }
  });

  it('proposes the four declarations a reader spends as read', () => {
    for (const id of [
      'keyword:$schema',
      'keyword:$vocabulary',
      'openapi.openapi',
      'openapi.jsonSchemaDialect',
    ]) {
      expect(rowWith(id).proposal).toMatchObject({
        zod: 'read',
        typescript: 'read',
        endpoints: 'read',
      });
    }
  });

  it('counts the rows Zod carries only by a check Castr writes', () => {
    expect(rows.filter((row) => row.proposal.zodByCastrCheck)).toHaveLength(26);
  });
});
