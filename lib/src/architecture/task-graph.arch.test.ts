import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(thisDir, '../../..');
const turboConfigPath = join(repoRoot, 'turbo.json');

function isObjectLike(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function loadCharacterDependsOn(): string[] {
  const parsed: unknown = JSON.parse(readFileSync(turboConfigPath, 'utf8'));
  if (!isObjectLike(parsed)) {
    return [];
  }

  const tasks = Reflect.get(parsed, 'tasks');
  if (!isObjectLike(tasks)) {
    return [];
  }

  const characterTask = Reflect.get(tasks, 'character');
  if (!isObjectLike(characterTask)) {
    return [];
  }

  const dependsOn = Reflect.get(characterTask, 'dependsOn');
  if (!Array.isArray(dependsOn) || dependsOn.some((value) => typeof value !== 'string')) {
    return [];
  }

  return dependsOn;
}

describe('Task Graph Contracts', () => {
  it('runs build before character because CLI characterisation executes dist artifacts', () => {
    const dependsOn = loadCharacterDependsOn();

    expect(dependsOn).toContain('build');
  });
});
