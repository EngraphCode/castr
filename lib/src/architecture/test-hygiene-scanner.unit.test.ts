/**
 * Test Hygiene Scanner (unit)
 *
 * Pure predicate tests: TypeScript source text in, boolean verdict out. The
 * probe matrix covers the full syntax space each predicate must recognise —
 * including the forms a substring scan under-matches (side-effect imports,
 * compound assignment operators) and the forms it over-matches (forbidden
 * patterns quoted as string data or comments, look-alike identifiers).
 */

import { describe, expect, it } from 'vitest';
import {
  mocksModuleRegistry,
  mutatesConsoleOrProcessEnv,
  mutatesGlobalStateViaVitestHelpers,
  touchesProcessEnv,
  usesFsModule,
} from './test-hygiene-scanner.js';

describe('usesFsModule', () => {
  it('detects a static default import', () => {
    expect(usesFsModule(`import fs from 'node:fs';`)).toBe(true);
  });

  it('detects a static named import', () => {
    expect(usesFsModule(`import { readFileSync } from 'fs';`)).toBe(true);
  });

  it('detects a side-effect (bare) import', () => {
    expect(usesFsModule(`import 'node:fs';`)).toBe(true);
  });

  it('detects a type-only import', () => {
    expect(usesFsModule(`import type { Stats } from 'node:fs';`)).toBe(true);
  });

  it('detects a dynamic import()', () => {
    expect(usesFsModule(`const fs = await import('node:fs/promises');`)).toBe(true);
  });

  it('detects a require call', () => {
    expect(usesFsModule(`const fs = require('fs-extra');`)).toBe(true);
  });

  it('detects an import-equals require', () => {
    expect(usesFsModule(`import fs = require('node:fs');`)).toBe(true);
  });

  it('detects a re-export', () => {
    expect(usesFsModule(`export * from 'node:fs';`)).toBe(true);
  });

  it('ignores non-filesystem imports', () => {
    expect(usesFsModule(`import path from 'node:path';`)).toBe(false);
  });

  it('ignores a filesystem specifier quoted as string data', () => {
    expect(usesFsModule(`const label = "x from 'node:fs'";`)).toBe(false);
  });

  it('ignores a look-alike identifier containing require', () => {
    expect(usesFsModule(`const fs = misrequire('fs');`)).toBe(false);
  });
});

describe('mocksModuleRegistry', () => {
  it('detects vi.mock', () => {
    expect(mocksModuleRegistry(`vi.mock('./module.js');`)).toBe(true);
  });

  it('detects vi.doMock', () => {
    expect(mocksModuleRegistry(`vi.doMock('./module.js');`)).toBe(true);
  });

  it('detects vi.unmock', () => {
    expect(mocksModuleRegistry(`vi.unmock('./module.js');`)).toBe(true);
  });

  it('detects vi.doUnmock', () => {
    expect(mocksModuleRegistry(`vi.doUnmock('./module.js');`)).toBe(true);
  });

  it('detects a call split across lines', () => {
    expect(mocksModuleRegistry(`vi\n  .mock('./module.js');`)).toBe(true);
  });

  it('detects element-access invocation', () => {
    expect(mocksModuleRegistry(`vi['doMock']('./module.js');`)).toBe(true);
  });

  it('detects invocation through an as-assertion on vi', () => {
    expect(mocksModuleRegistry(`(vi as VitestUtils).mock('./module.js');`)).toBe(true);
  });

  it('ignores the pattern quoted as string data', () => {
    expect(mocksModuleRegistry(`const note = "vi.mock('./module.js')";`)).toBe(false);
  });

  it('ignores a look-alike identifier ending in vi', () => {
    expect(mocksModuleRegistry(`avi.mock('./module.js');`)).toBe(false);
  });
});

describe('mutatesGlobalStateViaVitestHelpers', () => {
  it('detects vi.stubGlobal', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.stubGlobal('fetch', fake);`)).toBe(true);
  });

  it('detects vi.stubEnv', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.stubEnv('FOO', 'x');`)).toBe(true);
  });

  it('detects vi.spyOn targeting console', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(console, 'warn');`)).toBe(true);
  });

  it('detects vi.spyOn targeting process', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(process, 'exit');`)).toBe(true);
  });

  it('detects vi.spyOn targeting a process.env property path', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(process.env, 'FOO', 'get');`)).toBe(true);
  });

  it('detects vi.spyOn targeting globalThis', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(globalThis, 'fetch');`)).toBe(true);
  });

  it('detects vi.spyOn targeting console through an as-assertion', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(console as LoggerSink, 'warn');`)).toBe(
      true,
    );
  });

  it('ignores vi.spyOn targeting a local object', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`vi.spyOn(localSink, 'warn');`)).toBe(false);
  });

  it('ignores the pattern quoted as string data', () => {
    expect(mutatesGlobalStateViaVitestHelpers(`const s = "vi.stubEnv('A', 'b')";`)).toBe(false);
  });
});

describe('mutatesConsoleOrProcessEnv', () => {
  it('detects plain assignment to a console method', () => {
    expect(mutatesConsoleOrProcessEnv(`console.warn = () => {};`)).toBe(true);
  });

  it('detects plain assignment to a process.env property', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env.FOO = 'x';`)).toBe(true);
  });

  it('detects plain assignment to a process.env element', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env['FOO'] = 'x';`)).toBe(true);
  });

  it('detects compound += assignment to process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env.FOO += 'x';`)).toBe(true);
  });

  it('detects logical ||= assignment to process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env.FOO ||= 'x';`)).toBe(true);
  });

  it('detects nullish ??= assignment to a console method', () => {
    expect(mutatesConsoleOrProcessEnv(`console.warn ??= fallback;`)).toBe(true);
  });

  it('detects logical &&= assignment to process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env.FLAG &&= 'y';`)).toBe(true);
  });

  it('detects replacing process.env wholesale', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env = {};`)).toBe(true);
  });

  it('detects delete on a process.env property', () => {
    expect(mutatesConsoleOrProcessEnv(`delete process.env.FOO;`)).toBe(true);
  });

  it('detects increment on a process.env property', () => {
    expect(mutatesConsoleOrProcessEnv(`process.env.RUNS++;`)).toBe(true);
  });

  it('detects assignment through a globalThis prefix', () => {
    expect(mutatesConsoleOrProcessEnv(`globalThis.console.warn = fake;`)).toBe(true);
  });

  it('detects assignment through an as-assertion on console', () => {
    expect(mutatesConsoleOrProcessEnv(`(console as LoggerSink).warn = fake;`)).toBe(true);
  });

  it('detects assignment through an as-assertion on process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`(process.env as Record<string, string>).CI = '1';`)).toBe(
      true,
    );
  });

  it('detects assignment through a satisfies expression on console', () => {
    expect(mutatesConsoleOrProcessEnv(`(console satisfies LoggerSink).warn = fake;`)).toBe(true);
  });

  it('detects assignment through an angle-bracket assertion on console', () => {
    expect(mutatesConsoleOrProcessEnv(`(<LoggerSink>console).warn = fake;`)).toBe(true);
  });

  it('detects assignment through a non-null assertion on console', () => {
    expect(mutatesConsoleOrProcessEnv(`console!.warn = fake;`)).toBe(true);
  });

  it('detects assignment through nested mixed wrappers', () => {
    expect(mutatesConsoleOrProcessEnv(`((console as LoggerSink))!.warn = fake;`)).toBe(true);
  });

  it('detects delete through an as-assertion on process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`delete (process.env as Record<string, string>).CI;`)).toBe(
      true,
    );
  });

  it('ignores assignment to a non-global look-alike target', () => {
    expect(mutatesConsoleOrProcessEnv(`logger.warn = fake;`)).toBe(false);
  });

  it('ignores assignment through an as-assertion on a non-global target', () => {
    expect(mutatesConsoleOrProcessEnv(`(logger as LoggerSink).warn = fake;`)).toBe(false);
  });

  it('ignores equality comparison against process.env', () => {
    expect(
      mutatesConsoleOrProcessEnv(`const isProd = process.env.NODE_ENV === 'production';`),
    ).toBe(false);
  });

  it('ignores inequality comparison against process.env', () => {
    expect(mutatesConsoleOrProcessEnv(`if (process.env.CI !== undefined) {\n}`)).toBe(false);
  });

  it('ignores the pattern quoted as string data', () => {
    expect(mutatesConsoleOrProcessEnv(`const doc = "process.env.FOO = 'x'";`)).toBe(false);
  });

  it('ignores the pattern inside a comment', () => {
    expect(mutatesConsoleOrProcessEnv(`// console.warn = fake\nconst x = 1;`)).toBe(false);
  });
});

describe('touchesProcessEnv', () => {
  it('detects a property read in a condition', () => {
    expect(touchesProcessEnv(`if (process.env.CI) {\n}`)).toBe(true);
  });

  it('detects an element-access read', () => {
    expect(touchesProcessEnv(`const mode = process.env['NODE_ENV'];`)).toBe(true);
  });

  it('detects a read through element access on process', () => {
    expect(touchesProcessEnv(`const home = process['env'].HOME;`)).toBe(true);
  });

  it('detects a read in a comparison', () => {
    expect(touchesProcessEnv(`const isProd = process.env.NODE_ENV === 'production';`)).toBe(true);
  });

  it('detects aliasing process.env to a local', () => {
    expect(touchesProcessEnv(`const env = process.env;`)).toBe(true);
  });

  it('detects destructuring an entry out of process.env', () => {
    expect(touchesProcessEnv(`const { CI } = process.env;`)).toBe(true);
  });

  it('detects shorthand destructuring of env from process', () => {
    expect(touchesProcessEnv(`const { env } = process;`)).toBe(true);
  });

  it('detects renamed destructuring of env from process', () => {
    expect(touchesProcessEnv(`const { env: ambient } = process;`)).toBe(true);
  });

  it('detects rest destructuring from process', () => {
    expect(touchesProcessEnv(`const { ...copy } = process;`)).toBe(true);
  });

  it('detects a globalThis-qualified read', () => {
    expect(touchesProcessEnv(`const path = globalThis.process.env.PATH;`)).toBe(true);
  });

  it('detects a read through an as-assertion on process', () => {
    expect(touchesProcessEnv(`const ci = (process as NodeJS.Process).env.CI;`)).toBe(true);
  });

  it('detects a read through a satisfies expression on process', () => {
    expect(touchesProcessEnv(`const ci = (process satisfies object).env.CI;`)).toBe(true);
  });

  it('detects a read through an as-assertion on process.env', () => {
    expect(touchesProcessEnv(`const ci = (process.env as Record<string, string>).CI;`)).toBe(true);
  });

  it('detects destructuring env from an as-asserted process', () => {
    expect(touchesProcessEnv(`const { env } = process as NodeJS.Process;`)).toBe(true);
  });

  it('detects enumeration of process.env', () => {
    expect(touchesProcessEnv(`const keys = Object.keys(process.env);`)).toBe(true);
  });

  it('detects a mutation as a touch', () => {
    expect(touchesProcessEnv(`process.env.FOO = 'x';`)).toBe(true);
  });

  it('ignores env property access on a non-process object', () => {
    expect(touchesProcessEnv(`const env = fakeProcess.env;`)).toBe(false);
  });

  it('ignores a local variable named env', () => {
    expect(touchesProcessEnv(`const env = { CI: '1' };\nconst ci = env.CI;`)).toBe(false);
  });

  it('ignores destructuring env from a non-process object', () => {
    expect(touchesProcessEnv(`const { env } = options;`)).toBe(false);
  });

  it('ignores other property reads on process', () => {
    expect(touchesProcessEnv(`const version = process.version;`)).toBe(false);
  });

  it('ignores the pattern quoted as string data', () => {
    expect(touchesProcessEnv(`const s = "if (process.env.CI) {}";`)).toBe(false);
  });

  it('ignores the pattern inside a comment', () => {
    expect(touchesProcessEnv(`// process.env.CI\nconst x = 1;`)).toBe(false);
  });
});
