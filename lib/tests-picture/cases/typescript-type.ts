import { fileURLToPath } from 'node:url';

import {
  createCompilerHost,
  createProgram,
  createSourceFile,
  flattenDiagnosticMessageText,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
  SymbolFlags,
  type CompilerHost,
  type CompilerOptions,
  type Diagnostic,
  type Program,
  type SourceFile,
} from 'typescript';

import type { Converted } from './run-case.js';
import { CASE_COMPONENT } from './schema-case.js';
import { onOneLine } from './verdict.js';

/**
 * Where the two files the compiler is shown are said to be. Nothing is written there: the
 * compiler is given their text, and reads from disk only its own library and the packages
 * the generated module imports, which it finds from this place as a consumer's would be.
 */
const PLACE = fileURLToPath(new URL('../.tmp/', import.meta.url));
const GENERATED = `${PLACE}picture-generated.ts`;
const SAMPLES = `${PLACE}picture-samples.ts`;

const OPTIONS: CompilerOptions = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  target: ScriptTarget.ES2022,
  module: ModuleKind.NodeNext,
  moduleResolution: ModuleResolutionKind.NodeNext,
};

/**
 * A JSON value written as the TypeScript type that only it inhabits. JSON's own text is
 * that type: a string or number is a literal type, an array a tuple, an object an object
 * type. A constant declared with it is not a fresh literal, so the compiler decides plain
 * assignability, with no check for excess properties.
 */
function exactTypeOf(sample: unknown): string {
  return JSON.stringify(sample);
}

function samplesSource(samples: readonly unknown[]): string {
  const lines = [`import type { ${CASE_COMPONENT} } from './picture-generated.js';`];
  samples.forEach((sample, index) => {
    lines.push(
      `declare const sample${String(index)}: ${exactTypeOf(sample)};`,
      `export const checked${String(index)}: ${CASE_COMPONENT} = sample${String(index)};`,
    );
  });
  return lines.join('\n');
}

function hostShowing(texts: ReadonlyMap<string, string>): CompilerHost {
  const host = createCompilerHost(OPTIONS);
  const onDisk = {
    fileExists: host.fileExists.bind(host),
    readFile: host.readFile.bind(host),
    getSourceFile: host.getSourceFile.bind(host),
  };
  host.fileExists = (name) => texts.has(name) || onDisk.fileExists(name);
  host.readFile = (name) => texts.get(name) ?? onDisk.readFile(name);
  host.getSourceFile = (name, languageVersion, onError) => {
    const text = texts.get(name);
    return text === undefined
      ? onDisk.getSourceFile(name, languageVersion, onError)
      : createSourceFile(name, text, languageVersion, true);
  };
  return host;
}

function firstMessage(diagnostics: readonly Diagnostic[]): string | undefined {
  const first = diagnostics[0];
  return first === undefined
    ? undefined
    : onOneLine(flattenDiagnosticMessageText(first.messageText, ' '));
}

function exportsTheType(program: Program, generated: SourceFile): boolean {
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(generated);
  if (moduleSymbol === undefined) {
    return false;
  }
  return checker
    .getExportsOfModule(moduleSymbol)
    .some((symbol) => symbol.name === CASE_COMPONENT && (symbol.flags & SymbolFlags.Type) !== 0);
}

function sourceFileOf(program: Program, name: string): SourceFile {
  const found = program.getSourceFile(name);
  if (found === undefined) {
    throw new Error(`the compiler was not shown ${name}`);
  }
  return found;
}

/**
 * The type Castr generated for the case's shape, as something that decides a value: the
 * TypeScript compiler says whether each sample is assignable to it. The compiler is the
 * judge, outside Castr.
 *
 * Every sample is decided in one compilation, so the samples are given here and the
 * decision for any other value is refused.
 */
export function typeIn(content: string, samples: readonly unknown[]): Converted {
  const texts = new Map([
    [GENERATED, content],
    [SAMPLES, samplesSource(samples)],
  ]);
  const program = createProgram([SAMPLES], OPTIONS, hostShowing(texts));
  const generated = sourceFileOf(program, GENERATED);
  const broken = firstMessage([
    ...program.getSyntacticDiagnostics(generated),
    ...program.getSemanticDiagnostics(generated),
  ]);
  if (broken !== undefined) {
    return { kind: 'output unusable', reason: `does not compile: ${broken}` };
  }
  if (!exportsTheType(program, generated)) {
    return { kind: 'nothing emitted' };
  }
  const checks = sourceFileOf(program, SAMPLES);
  const refusedLines = new Set(
    program
      .getSemanticDiagnostics(checks)
      .map((diagnostic) => checks.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line),
  );
  // Sample n is declared on line 2n + 1 and assigned on line 2n + 2, counting from zero.
  const decided = new Map(
    samples.map((sample, index) => [exactTypeOf(sample), !refusedLines.has(2 * index + 2)]),
  );
  return {
    kind: 'decides',
    accepts: (value) => {
      const decision = decided.get(exactTypeOf(value));
      if (decision === undefined) {
        throw new Error(`the compiler was not asked about ${exactTypeOf(value)}`);
      }
      return decision;
    },
  };
}
