/**
 * Reading Zod's types through the compiler: what the two readings of Zod share.
 *
 * Nothing here reads the text of a declaration. Every name and every literal value comes
 * from a type or a symbol the compiler has resolved.
 */

import { fileURLToPath } from 'node:url';

import {
  Project,
  ts,
  type Node,
  type SourceFile,
  type Symbol as MorphSymbol,
  type Type,
} from 'ts-morph';

/** A probe: a small source file that imports Zod, compiled against the installed package. */
export interface ZodProbe {
  readonly file: SourceFile;
  /** Every name the imported module exports, aliases followed by the caller. */
  readonly exported: readonly MorphSymbol[];
}

/** Orders two names the same way on every machine. */
export function byName(left: string, right: string): number {
  return left.localeCompare(right, 'en');
}

export function membersOf(type: Type): readonly Type[] {
  return type.isUnion() ? type.getUnionTypes() : [type];
}

/** The string literals a type states, in order of name; none for a type that states none. */
export function literalValues(type: Type | undefined): readonly string[] {
  if (type === undefined) {
    return [];
  }
  return membersOf(type)
    .map((member) => member.getLiteralValue())
    .filter((value) => typeof value === 'string')
    .sort(byName);
}

export function propertyType(type: Type | undefined, name: string, at: Node): Type | undefined {
  return type?.getProperty(name)?.getTypeAtLocation(at);
}

/** The definition a schema or a check holds, or nothing for a type that holds none. */
export function definitionOf(type: Type | undefined, at: Node): Type | undefined {
  return propertyType(propertyType(type, '_zod', at), 'def', at);
}

/** The type an exported interface declares, or nothing for an export that is not one. */
export function declaredInterface(symbol: MorphSymbol): Type | undefined {
  const target = symbol.isAlias() ? symbol.getAliasedSymbolOrThrow() : symbol;
  const isInterface = target
    .getDeclarations()
    .some((declaration) => declaration.getKind() === ts.SyntaxKind.InterfaceDeclaration);
  return isInterface ? target.getDeclaredType() : undefined;
}

/**
 * Compiles a probe that imports one module of Zod, and fails if it does not compile.
 *
 * @param name - the probe's file name, beside this module; it is never written to disk
 * @param module - the module of Zod the probe imports
 * @param source - the probe's source, which imports `module`
 */
export function compileZodProbe(name: string, module: string, source: string): ZodProbe {
  const project = new Project({
    compilerOptions: {
      strict: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      skipLibCheck: true,
      noEmit: true,
    },
    skipAddingFilesFromTsConfig: true,
  });
  const file = project.createSourceFile(fileURLToPath(new URL(name, import.meta.url)), source, {
    overwrite: true,
  });
  const unresolved = project.getPreEmitDiagnostics();
  if (unresolved.length > 0) {
    throw new Error(`the probe ${name} does not compile: ${String(unresolved.length)}`);
  }
  const imported = file.getImportDeclarationOrThrow(module).getModuleSpecifierSourceFileOrThrow();
  return {
    file,
    exported: project.getTypeChecker().getExportsOfModule(imported.getSymbolOrThrow()),
  };
}
