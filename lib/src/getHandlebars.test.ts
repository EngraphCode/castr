import { describe, it, expect } from 'vitest';
import { getHandlebars } from './getHandlebars.js';

/**
 * Unit Tests: Handlebars Instance Creation and Helpers
 *
 * These tests validate that getHandlebars creates a properly configured
 * Handlebars instance with custom helpers registered.
 */
describe('getHandlebars', () => {
  it('should create a Handlebars instance', () => {
    const instance = getHandlebars();

    expect(instance).toBeDefined();
    expect(typeof instance.compile).toBe('function');
  });

  it('should register ifeq helper', () => {
    const instance = getHandlebars();
    const template = instance.compile('{{#ifeq a b}}equal{{else}}not equal{{/ifeq}}');

    // Test equality
    expect(template({ a: 'test', b: 'test' })).toBe('equal');
    // Test inequality
    expect(template({ a: 'test', b: 'other' })).toBe('not equal');
  });

  it('should register ifNotEmptyObj helper', () => {
    const instance = getHandlebars();
    const template = instance.compile(
      '{{#ifNotEmptyObj obj}}has properties{{else}}empty{{/ifNotEmptyObj}}',
    );

    // Test non-empty object
    expect(template({ obj: { key: 'value' } })).toBe('has properties');
    // Test empty object
    expect(template({ obj: {} })).toBe('empty');
  });

  it('should register toCamelCase helper', () => {
    const instance = getHandlebars();
    const template = instance.compile('{{toCamelCase input}}');

    // Test snake_case
    expect(template({ input: 'hello_world' })).toBe('helloWorld');
    // Test kebab-case
    expect(template({ input: 'hello-world' })).toBe('helloWorld');
    // Test space separated
    expect(template({ input: 'hello world' })).toBe('helloWorld');
    // Test already camelCase
    expect(template({ input: 'helloWorld' })).toBe('helloWorld');
  });

  it('should handle toCamelCase with multiple words', () => {
    const instance = getHandlebars();
    const template = instance.compile('{{toCamelCase input}}');

    expect(template({ input: 'some_long_variable_name' })).toBe('someLongVariableName');
    expect(template({ input: 'GET-USER-BY-ID' })).toBe('getUserById');
  });

  it('should create independent instances', () => {
    const instance1 = getHandlebars();
    const instance2 = getHandlebars();

    // Both should work but be independent
    expect(instance1).toBeDefined();
    expect(instance2).toBeDefined();
    expect(instance1).not.toBe(instance2);
  });
});
