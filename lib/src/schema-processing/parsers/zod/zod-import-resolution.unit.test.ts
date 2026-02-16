/**
 * Tests for Zod import resolution.
 *
 * Verifies that identifiers are resolved to their import source
 * rather than using getText() string comparisons per ADR-026.
 */

import { describe, it, expect } from 'vitest';
import type { Identifier } from 'ts-morph';
import { Node, Project, SyntaxKind } from 'ts-morph';
import { createZodProject } from './zod-ast.js';
import { ZodImportResolver } from './zod-import-resolver.js';

/**
 * Asserts a value is defined and returns it with the narrowed type.
 * Replaces non-null assertions (`!`) which are banned by lint.
 */
function defined<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Expected ${label} to be defined`);
  }
  return value;
}

/**
 * Creates a raw ts-morph Project without the auto-prepended zod import.
 *
 * Use this instead of `createZodProject` when testing negative scenarios
 * (e.g. local variable shadowing, non-zod imports) that would be masked
 * by the always-prepended `import { z } from 'zod'`.
 */
function createRawProject(source: string): Project {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      target: 99,
      module: 99,
      moduleResolution: 2,
    },
  });
  project.createSourceFile('input.ts', source);
  project.createSourceFile('node_modules/zod/index.d.ts', 'export declare const z: any;');
  return project;
}

/**
 * Finds the first Identifier whose symbol name matches `name` and whose
 * parent is a PropertyAccessExpression.
 *
 * Uses semantic symbol resolution (`getSymbol()?.getName()`) instead of
 * `getText()` to align with ADR-026.
 */
function findPropertyAccessIdentifier(
  sourceFile: ReturnType<Project['getSourceFiles']>[number],
  name: string,
): Identifier {
  return defined(
    sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .find(
        (id) =>
          id.getSymbol()?.getName() === name && Node.isPropertyAccessExpression(id.getParent()),
      ),
    `${name} identifier`,
  );
}

// ============================================================================
// resolveToZodImport
// ============================================================================

describe('resolveToZodImport', () => {
  it('resolves `z` from `import { z } from "zod"`', () => {
    const { sourceFile, resolver } = createZodProject(`
      import { z } from 'zod';
      const schema = z.string();
    `);
    const zId = findPropertyAccessIdentifier(sourceFile, 'z');
    expect(resolver.resolveToZodImport(zId)).toBe(true);
  });

  it('resolves aliased `z` from `import { z as myZ } from "zod"`', () => {
    const { sourceFile, resolver } = createZodProject(`
      import { z as myZ } from 'zod';
      const schema = myZ.string();
    `);
    const myZId = findPropertyAccessIdentifier(sourceFile, 'myZ');
    expect(resolver.resolveToZodImport(myZId)).toBe(true);
  });

  it('resolves namespace import `import * as zod from "zod"`', () => {
    const { sourceFile, resolver } = createZodProject(`
      import * as zod from 'zod';
      const schema = zod.string();
    `);
    const zodId = findPropertyAccessIdentifier(sourceFile, 'zod');
    expect(resolver.resolveToZodImport(zodId)).toBe(true);
  });

  it('rejects `z` imported from a different module', () => {
    // Use raw Project (not createZodProject) to avoid the auto-prepended
    // zod import which would create a duplicate `z` binding.
    const project = createRawProject(`import { z } from 'other-lib';\nconst schema = z.string();`);
    project.createSourceFile('node_modules/other-lib/index.d.ts', 'export declare const z: any;');
    const zodDeclFile = defined(
      project.getSourceFile('node_modules/zod/index.d.ts'),
      'zodDeclFile',
    );
    const resolver = new ZodImportResolver(zodDeclFile);
    const sourceFile = defined(project.getSourceFile('input.ts'), 'sourceFile');
    const zId = findPropertyAccessIdentifier(sourceFile, 'z');
    expect(resolver.resolveToZodImport(zId)).toBe(false);
  });

  it('rejects a non-imported `z` identifier (local variable)', () => {
    // Use raw Project (not createZodProject) to avoid the auto-prepended
    // zod import. This tests resolveToZodImport's ability to distinguish
    // local variables from zod imports.
    const project = createRawProject(`const z = { string: () => {} };\nconst schema = z.string();`);
    const zodDeclFile = defined(
      project.getSourceFile('node_modules/zod/index.d.ts'),
      'zodDeclFile',
    );
    const resolver = new ZodImportResolver(zodDeclFile);
    const sourceFile = defined(project.getSourceFile('input.ts'), 'sourceFile');
    const zId = findPropertyAccessIdentifier(sourceFile, 'z');
    expect(resolver.resolveToZodImport(zId)).toBe(false);
  });

  it('resolves `z` from auto-prepended import (no explicit import in source)', () => {
    // createZodProject always prepends `import { z } from 'zod'`, so even
    // source without an explicit import should resolve z via the synthetic one.
    const { sourceFile, resolver } = createZodProject(`
      const __schema = z.string();
    `);
    const zId = findPropertyAccessIdentifier(sourceFile, 'z');
    expect(resolver.resolveToZodImport(zId)).toBe(true);
  });
});

// ============================================================================
// isZodNamespaceAccess
// ============================================================================

describe('isZodNamespaceAccess', () => {
  it('identifies z.string as a Zod namespace access', () => {
    const { sourceFile, resolver } = createZodProject(`
      import { z } from 'zod';
      const schema = z.string();
    `);
    const propAccess = defined(
      sourceFile
        .getDescendants()
        .find((n) => Node.isPropertyAccessExpression(n) && n.getName() === 'string'),
      'z.string property access',
    );
    expect(resolver.isZodNamespaceAccess(propAccess)).toBe(true);
  });

  it('identifies z.iso.date as a Zod namespace access', () => {
    const { sourceFile, resolver } = createZodProject(`
      import { z } from 'zod';
      const schema = z.iso.date();
    `);
    // z.iso is the inner PropertyAccessExpression
    const propAccess = defined(
      sourceFile
        .getDescendants()
        .find((n) => Node.isPropertyAccessExpression(n) && n.getName() === 'iso'),
      'z.iso property access',
    );
    expect(resolver.isZodNamespaceAccess(propAccess)).toBe(true);
  });

  it('rejects property access on non-Zod identifier', () => {
    const { sourceFile, resolver } = createZodProject(`
      import { z } from 'zod';
      const foo = { string: () => {} };
      const schema = foo.string();
    `);
    const propAccess = defined(
      sourceFile
        .getDescendants()
        .find(
          (n) =>
            Node.isPropertyAccessExpression(n) &&
            n.getName() === 'string' &&
            Node.isIdentifier(n.getExpression()) &&
            n.getExpression().getSymbol()?.getName() === 'foo',
        ),
      'foo.string property access',
    );
    expect(resolver.isZodNamespaceAccess(propAccess)).toBe(false);
  });
});
