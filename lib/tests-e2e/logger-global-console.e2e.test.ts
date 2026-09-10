import { execFile, type ExecFileOptions } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const libRoot = fileURLToPath(new URL('../', import.meta.url));
const loggerModule = pathToFileURL(
  fileURLToPath(new URL('../dist/index.js', import.meta.url)),
).href;
const childOptions = {
  cwd: libRoot,
  timeout: 5_000,
  killSignal: 'SIGKILL',
} satisfies ExecFileOptions;

describe('default logger global console binding', () => {
  it('uses the current global console when a log call runs', async () => {
    const script = [
      `const { logger } = await import(${JSON.stringify(loggerModule)});`,
      `const calls = [];`,
      `globalThis.console = {`,
      `  ...globalThis.console,`,
      `  info: (...args) => calls.push({ level: 'info', args }),`,
      `  warn: (...args) => calls.push({ level: 'warn', args }),`,
      `  error: (...args) => calls.push({ level: 'error', args }),`,
      `};`,
      `logger.info('installed after import', 1);`,
      `logger.warn('warning', false);`,
      `logger.error('failure', null);`,
      `process.stdout.write(JSON.stringify(calls));`,
    ].join('\n');

    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ['--input-type=module', '-e', script],
      childOptions,
    );

    expect(stderr).toBe('');
    expect(stdout).toBe(
      '[{"level":"info","args":["[INFO]","installed after import",1]},' +
        '{"level":"warn","args":["[WARN]","warning",false]},' +
        '{"level":"error","args":["[ERROR]","failure",null]}]',
    );
  });
});
