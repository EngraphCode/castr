import path from 'node:path';

import type { Options } from 'prettier';
import { describe, expect, test } from 'vitest';

import type { PrettierConfigResolveFn } from './resolve-prettier-config.js';
import { resolvePrettierConfigForOutput } from './resolve-prettier-config.js';

/**
 * Pure contract proofs for the anchoring behaviour: which path the injected
 * resolver receives, and how an explicit config path is forwarded. The
 * real-filesystem behaviour proof (decoy configs, prettier's actual config
 * search) lives in `tests-snapshot/integration/resolve-prettier-config.test.ts`
 * — in-process suites do no IO.
 */
describe('resolvePrettierConfigForOutput', () => {
  const resolvedOptions: Options = { printWidth: 42 };

  interface RecordedCall {
    fileUrlOrPath: string;
    options: { config?: string } | undefined;
  }

  test('file output anchors resolution on the output file itself, in discovery mode', async () => {
    const calls: RecordedCall[] = [];
    const recordingResolve: PrettierConfigResolveFn = (fileUrlOrPath, options) => {
      calls.push({ fileUrlOrPath, options });
      return Promise.resolve(resolvedOptions);
    };

    const config = await resolvePrettierConfigForOutput(
      '/virtual/generated/client.ts',
      undefined,
      'file',
      recordingResolve,
    );

    expect(calls).toEqual([{ fileUrlOrPath: '/virtual/generated/client.ts', options: undefined }]);
    expect(config).toBe(resolvedOptions);
  });

  test('directory output anchors resolution on a child INSIDE the directory', async () => {
    // For the tag-file / method-file grouping strategies the renderer treats
    // the output path as a DIRECTORY and writes files beneath it. prettier's
    // resolveConfig starts its config search at the dirname of its argument,
    // so the anchor must be a path inside the directory — anchoring on the
    // directory path itself starts the search at the directory's PARENT and
    // silently skips a config in the output directory.
    const anchorDirnames: string[] = [];
    const recordingResolve: PrettierConfigResolveFn = (fileUrlOrPath) => {
      anchorDirnames.push(path.dirname(fileUrlOrPath));
      return Promise.resolve(resolvedOptions);
    };

    const config = await resolvePrettierConfigForOutput(
      '/virtual/generated',
      undefined,
      'directory',
      recordingResolve,
    );

    expect(anchorDirnames).toEqual(['/virtual/generated']);
    expect(config).toBe(resolvedOptions);
  });

  test("an explicit config path is loaded via prettier's config option", async () => {
    const calls: RecordedCall[] = [];
    const recordingResolve: PrettierConfigResolveFn = (fileUrlOrPath, options) => {
      calls.push({ fileUrlOrPath, options });
      return Promise.resolve(resolvedOptions);
    };

    const config = await resolvePrettierConfigForOutput(
      '/virtual/generated/client.ts',
      '/virtual/configs/custom-prettier.json',
      'file',
      recordingResolve,
    );

    expect(calls).toEqual([
      {
        fileUrlOrPath: '/virtual/generated/client.ts',
        options: { config: '/virtual/configs/custom-prettier.json' },
      },
    ]);
    expect(config).toBe(resolvedOptions);
  });

  test('directory output with an explicit config path anchors inside the directory AND forwards the config', async () => {
    const calls: RecordedCall[] = [];
    const recordingResolve: PrettierConfigResolveFn = (fileUrlOrPath, options) => {
      calls.push({ fileUrlOrPath, options });
      return Promise.resolve(resolvedOptions);
    };

    const config = await resolvePrettierConfigForOutput(
      '/virtual/generated',
      '/virtual/configs/custom-prettier.json',
      'directory',
      recordingResolve,
    );

    expect(calls.map((call) => path.dirname(call.fileUrlOrPath))).toEqual(['/virtual/generated']);
    expect(calls.map((call) => call.options)).toEqual([
      { config: '/virtual/configs/custom-prettier.json' },
    ]);
    expect(config).toBe(resolvedOptions);
  });

  test('returns null unchanged when no config applies', async () => {
    const nullResolve: PrettierConfigResolveFn = () => Promise.resolve(null);

    const config = await resolvePrettierConfigForOutput(
      '/virtual/generated/client.ts',
      undefined,
      'file',
      nullResolve,
    );

    expect(config).toBeNull();
  });
});
