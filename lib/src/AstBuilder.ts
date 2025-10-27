/**
 * AstBuilder - A type-safe, fluent wrapper around ts-morph
 * 
 * Provides a simple API for generating TypeScript type declarations
 * without the complexity of direct ts-morph usage.
 * 
 * Design goals:
 * - Zero type assertions
 * - Fluent API (method chaining)
 * - Hide ts-morph implementation details
 * - Focus on OpenAPI → TypeScript use case
 */

import { Project, type SourceFile } from 'ts-morph';

/**
 * Property definition for interfaces
 */
export type PropertyDefinition = {
  name: string;
  type: string;
  optional?: boolean;
  readonly?: boolean;
  docs?: string[];
};

/**
 * Options for type aliases
 */
export type TypeAliasOptions = {
  exported?: boolean;
  docs?: string[];
};

/**
 * Options for interfaces
 */
export type InterfaceOptions = {
  exported?: boolean;
  docs?: string[];
  indexSignature?: {
    keyName: string;
    keyType: string;
    returnType: string;
  };
};

/**
 * AstBuilder - Fluent API for generating TypeScript declarations
 * 
 * @example
 * ```typescript
 * const builder = new AstBuilder();
 * builder
 *   .addImport('zod', ['z'])
 *   .addTypeAlias('User', '{ id: string; name: string }')
 *   .addInterface('IUser', [
 *     { name: 'id', type: 'string' },
 *     { name: 'name', type: 'string' },
 *   ]);
 * 
 * const output = builder.toString();
 * ```
 */
export class AstBuilder {
  private project: Project;
  private sourceFile: SourceFile;

  constructor() {
    // Use in-memory file system for performance and isolation
    this.project = new Project({ useInMemoryFileSystem: true });
    this.sourceFile = this.project.createSourceFile('generated.ts', '', { overwrite: true });
  }

  /**
   * Add named imports from a module
   * 
   * @param moduleSpecifier - The module to import from (e.g., 'zod')
   * @param namedImports - Array of named exports to import
   * @returns this for method chaining
   * 
   * @example
   * ```typescript
   * builder.addImport('zod', ['z', 'ZodType']);
   * // Output: import { z, ZodType } from "zod";
   * ```
   */
  addImport(moduleSpecifier: string, namedImports: string[]): this {
    this.sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports,
    });
    return this;
  }

  /**
   * Add a type alias declaration
   * 
   * @param name - The name of the type
   * @param type - The type definition as a string
   * @param options - Optional configuration (exported, docs)
   * @returns this for method chaining
   * 
   * @example
   * ```typescript
   * builder.addTypeAlias('User', '{ id: string; name: string }', {
   *   docs: ['Represents a user'],
   * });
   * // Output:
   * // /**
   * //  * Represents a user
   * //  *\/
   * // export type User = { id: string; name: string };
   * ```
   */
  addTypeAlias(name: string, type: string, options: TypeAliasOptions = {}): this {
    const { exported = true, docs } = options;

    this.sourceFile.addTypeAlias({
      name,
      type,
      isExported: exported,
      ...(docs && docs.length > 0 ? { docs } : {}),
    });
    return this;
  }

  /**
   * Add an interface declaration
   * 
   * @param name - The name of the interface
   * @param properties - Array of property definitions
   * @param options - Optional configuration (exported, docs, indexSignature)
   * @returns this for method chaining
   * 
   * @example
   * ```typescript
   * builder.addInterface('Person', [
   *   { name: 'id', type: 'number' },
   *   { name: 'email', type: 'string', optional: true },
   * ]);
   * // Output:
   * // export interface Person {
   * //   id: number;
   * //   email?: string;
   * // }
   * ```
   */
  addInterface(name: string, properties: PropertyDefinition[], options: InterfaceOptions = {}): this {
    const { exported = true, docs, indexSignature } = options;

    this.sourceFile.addInterface({
      name,
      isExported: exported,
      ...(docs && docs.length > 0 ? { docs } : {}),
      properties: properties.map((prop) => ({
        name: prop.name,
        type: prop.type,
        ...(prop.optional ? { hasQuestionToken: true } : {}),
        ...(prop.readonly ? { isReadonly: true } : {}),
        ...(prop.docs && prop.docs.length > 0 ? { docs: prop.docs } : {}),
      })),
      ...(indexSignature
        ? {
            indexSignatures: [
              {
                keyName: indexSignature.keyName,
                keyType: indexSignature.keyType,
                returnType: indexSignature.returnType,
              },
            ],
          }
        : {}),
    });
    return this;
  }

  /**
   * Get the generated TypeScript code as a string
   * 
   * @returns The complete TypeScript code with all declarations
   * 
   * @example
   * ```typescript
   * const output = builder.toString();
   * console.log(output);
   * ```
   */
  toString(): string {
    return this.sourceFile.getFullText();
  }

  /**
   * Alias for toString() for clarity
   * Same as toString(), provided for better readability
   * 
   * @returns The complete TypeScript code with all declarations
   */
  getFullText(): string {
    return this.toString();
  }
}

