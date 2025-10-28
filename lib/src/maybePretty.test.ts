import { describe, test, expect } from 'vitest';
import { maybePretty } from './maybePretty.js';

describe('maybePretty', () => {
  test('formats valid TypeScript code', async () => {
    const input = `const x:string="hello";`;
    const result = await maybePretty(input);

    expect(result).toContain('const x: string');
    expect(result).toContain('"hello"');
    expect(result).not.toBe(input); // Should be formatted differently
  });

  test('handles code with trailing whitespace', async () => {
    const input = `  const x = 1;  \n\n  `;
    const result = await maybePretty(input);

    expect(result).toBe('const x = 1;\n');
  });

  test('returns input on syntax error', async () => {
    const input = `const x = {{{invalid syntax`;
    const result = await maybePretty(input);

    expect(result).toBe(input);
  });

  test('formats complex TypeScript with types', async () => {
    const input = `type User={name:string,age:number};const users:User[]=[{name:"Alice",age:30}];`;
    const result = await maybePretty(input);

    expect(result).toContain('type User =');
    expect(result).toContain('name: string');
    expect(result).toContain('age: number');
    expect(result).toContain('const users: User[]');
  });

  test('respects custom prettier options', async () => {
    const input = `const x = "hello";`;
    const result = await maybePretty(input, {
      semi: false,
      singleQuote: true,
    });

    expect(result).toContain("const x = 'hello'"); // single quotes
    expect(result).not.toContain(';'); // no semicolon
  });

  test('handles prettier config with undefined plugins gracefully', async () => {
    const input = `const x: string = "hello";`;
    // Simulate a prettier config that might have plugins: undefined
    const result = await maybePretty(input, {
      plugins: undefined as any,
      printWidth: 80,
    });

    expect(result).toContain('const x: string');
    expect(result).not.toBe(input);
  });

  test('handles prettier config with empty plugins array', async () => {
    const input = `const x: string = "hello";`;
    const result = await maybePretty(input, {
      plugins: [] as any,
      printWidth: 80,
    });

    expect(result).toContain('const x: string');
    expect(result).not.toBe(input);
  });

  test('handles prettier config with invalid plugins gracefully', async () => {
    const input = `const x: string = "hello";`;
    const result = await maybePretty(input, {
      plugins: [null, undefined] as any,
      printWidth: 80,
    });

    expect(result).toContain('const x: string');
    expect(result).not.toBe(input);
  });

  test('formats Zod schema code', async () => {
    const input = `const schema=z.object({name:z.string(),age:z.number()});`;
    const result = await maybePretty(input);

    expect(result).toContain('const schema = z.object(');
    expect(result).toContain('name: z.string()');
    expect(result).toContain('age: z.number()');
  });

  test('formats export statements', async () => {
    const input = `export type User={name:string};export const userSchema=z.object({name:z.string()});`;
    const result = await maybePretty(input);

    expect(result).toContain('export type User');
    expect(result).toContain('export const userSchema');
  });

  test('handles null options', async () => {
    const input = `const x = 1;`;
    const result = await maybePretty(input, null);

    expect(result).toBe('const x = 1;\n');
  });

  test('handles undefined options', async () => {
    const input = `const x = 1;`;
    const result = await maybePretty(input);

    expect(result).toBe('const x = 1;\n');
  });

  test('preserves custom formatting rules', async () => {
    const input = `function test(){return "hello"}`;
    const result = await maybePretty(input, {
      printWidth: 20, // Force multi-line
    });

    expect(result).toContain('function test()');
    expect(result).toContain('return');
    expect(result).toContain('"hello"');
  });

  test('formats JSDoc comments correctly', async () => {
    const input = `/** @param x the value */function test(x:string){return x;}`;
    const result = await maybePretty(input);

    expect(result).toContain('@param x');
    expect(result).toContain('function test(x: string)');
  });

  test('handles empty string', async () => {
    const input = ``;
    const result = await maybePretty(input);

    expect(result).toBe('');
  });

  test('handles whitespace-only string', async () => {
    const input = `   \n\n\t  `;
    const result = await maybePretty(input);

    expect(result).toBe('');
  });
});
