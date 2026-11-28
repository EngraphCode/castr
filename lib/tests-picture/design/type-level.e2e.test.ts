/**
 * Two proofs the compiler makes: the kinds of the prototype are closed, and the members
 * of an equivalence set are one value.
 *
 * Each compiles a small program against the prototype's types, in memory, and reads the
 * compiler's verdict. Each also shows the verdict has teeth: a function that misses one
 * kind does not compile, and two values that only look alike are not one type. The
 * prototype's source files are read from the repository, so this is an end-to-end test.
 */

import { fileURLToPath } from 'node:url';

import { Node, Project } from 'ts-morph';
import { describe, it, expect } from 'vitest';

const HERE = fileURLToPath(new URL('.', import.meta.url));

/** Compiles a program beside the prototype and counts what the compiler objects to in it. */
function objections(source: string): number {
  const project = new Project({
    compilerOptions: { strict: true, noImplicitReturns: true, noEmit: true },
  });
  project.addSourceFilesAtPaths([`${HERE}model.ts`, `${HERE}boundary.ts`]);
  const file = project.createSourceFile(`${HERE}in-memory-program.ts`, source);
  return file.getPreEmitDiagnostics().length;
}

/** The literals that tell the members of a union of objects apart, read by the compiler. */
function kindsOf(file: string, union: string, by: string): readonly string[] {
  const project = new Project({ compilerOptions: { strict: true } });
  const alias = project.addSourceFileAtPath(`${HERE}${file}`).getTypeAliasOrThrow(union);
  const node = alias.getTypeNodeOrThrow();
  const members = Node.isUnionTypeNode(node) ? node.getTypeNodes() : [node];
  return members.flatMap((member) => {
    const literal = member.getType().getProperty(by)?.getTypeAtLocation(alias);
    return literal?.isStringLiteral() === true ? [String(literal.getLiteralValue())] : [];
  });
}

function exhaustive(file: string, union: string, by: string, kinds: readonly string[]): string {
  const cases = kinds.map((kind) => `    case '${kind}': return '${kind}';`).join('\n');
  return [
    `import type { ${union} } from './${file.replace('.ts', '.js')}';`,
    `export function nameOf(value: ${union}): string {`,
    `  switch (value.${by}) {`,
    cases,
    '  }',
    '}',
  ].join('\n');
}

const CLOSED_SETS = [
  ['model.ts', 'Shape', 'kind'],
  ['model.ts', 'Step', 'step'],
  ['model.ts', 'Constant', 'kind'],
  ['boundary.ts', 'Part', 'part'],
] as const;

describe('the kinds of the prototype are closed', () => {
  it.each(CLOSED_SETS)('%s: a function over every kind of %s compiles', (file, union, by) => {
    const kinds = kindsOf(file, union, by);

    expect(kinds.length).toBeGreaterThan(3);
    expect(objections(exhaustive(file, union, by, kinds))).toBe(0);
  });

  it.each(CLOSED_SETS)(
    '%s: a function that misses any one kind of %s does not',
    (file, union, by) => {
      const kinds = kindsOf(file, union, by);
      const compiled = kinds.filter(
        (missing) =>
          objections(
            exhaustive(
              file,
              union,
              by,
              kinds.filter((kind) => kind !== missing),
            ),
          ) === 0,
      );

      expect(compiled).toEqual([]);
    },
  );
});

const SAME = [
  'type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;',
  "import type { Shape } from './model.js';",
].join('\n');

function oneValue(left: string, right: string): string {
  return [
    SAME,
    `const left = ${left} as const satisfies Shape;`,
    `const right = ${right} as const satisfies Shape;`,
    'export const same: Same<typeof left, typeof right> = true;',
  ].join('\n');
}

describe('the members of an equivalence set are one value', () => {
  it('a string or null, however its source wrote the choice', () => {
    // `type: ["string", "null"]`, `anyOf` of the two, and a nullable Zod string.
    const value = "{ kind: 'by-kind', kinds: { string: 'any', null: 'any' } }";

    expect(objections(oneValue(value, value))).toBe(0);
  });

  it('one stated value, whether written as a constant, an enumeration of one or a literal', () => {
    const value = "{ kind: 'values', values: [{ kind: 'string', value: 'a' }] }";

    expect(objections(oneValue(value, value))).toBe(0);
  });

  it('every value, written as `true` or as `{}`', () => {
    expect(objections(oneValue("{ kind: 'every' }", "{ kind: 'every' }"))).toBe(0);
  });

  it('is not what an object that states no policy and the same object closed are', () => {
    const unstated = "{ kind: 'by-kind', kinds: { object: { rest: 'unstated' } } }";
    const closed = "{ kind: 'by-kind', kinds: { object: { rest: { kind: 'none' } } } }";

    expect(objections(oneValue(unstated, closed))).toBeGreaterThan(0);
  });

  it('is not what a value of the wrong form is, which is no shape at all', () => {
    expect(objections(oneValue("{ kind: 'sometimes' }", "{ kind: 'sometimes' }"))).toBeGreaterThan(
      0,
    );
  });
});
