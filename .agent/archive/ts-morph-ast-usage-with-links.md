# Using TS-Morph for TypeScript AST Manipulation and Code Generation

> **📋 Historical Reference Document**  
> This document was created during early architecture exploration (pre-IR implementation).
> It remains useful as a reference for ts-morph patterns, but the current architecture
> uses writers operating on the canonical IR. See [ADR-023](../../docs/architectural_decision_records/ADR-023-ir-based-architecture.md).

## Overview of TS-Morph

**TS-Morph** is a high-level TypeScript AST library that wraps the TypeScript Compiler API to simplify code analysis and generation ([npm package](https://www.npmjs.com/package/ts-morph), [official docs](https://ts-morph.com/)). Instead of manually traversing compiler AST nodes, TS-Morph provides an intuitive API to create, navigate, and modify TypeScript source files programmatically. This makes it ideal for tasks like generating TypeScript types from schemas or reading TypeScript code to produce other specifications. In the context of an SDK generator (as described in the question), TS-Morph can serve as the **single source of truth** – you can parse input definitions (OpenAPI, Zod, JSON Schema) into an AST and then output TypeScript code, or inversely parse TypeScript (e.g. Zod schemas) into an AST to produce equivalent OpenAPI/JSON Schema definitions.

## Setting Up a TS-Morph Project

To start using TS-Morph, you typically create a `Project` which acts as a container for source files and provides access to the TypeScript compiler under the hood. For example:

```ts
import { Project } from 'ts-morph';
const project = new Project({
  // Optionally specify compiler options, tsconfig.json, virtual file system, etc.
  // If you initialize with a tsconfig.json, it will automatically load source files.
});
```

This `Project` can be configured with compiler settings or linked to a **tsconfig** file to include existing files (see [Project setup and adding source files](https://ts-morph.com/setup/adding-source-files)). You can then add or create source files. For instance, to create a new source file:

```ts
const sourceFile = project.createSourceFile('Models.ts', '', { overwrite: true });
```

If you want to work with existing files (say, to read Zod schemas), you can use `project.addSourceFileAtPath` or `addSourceFilesAtPaths` to load them into the project. Once the project is set up and files are added/modified, remember to save the changes (for example `await project.save()` or `sourceFile.saveSync()`) so that the generated code is written to disk (see [Source files - saving](https://ts-morph.com/details/source-files)).

## Creating TypeScript Structures (Classes, Interfaces, Types)

**TS-Morph provides high-level methods** to create TypeScript structures using convenient _structure objects_. For example, you can add a new interface or class with properties in one call:

```ts
// Add an exported interface with two properties:
const interfaceDec = sourceFile.addInterface({
  name: 'Pet',
  isExported: true,
  properties: [
    { name: 'id', type: 'number' },
    { name: 'tags', type: 'string[]' }, // an array property
  ],
});
```

This will produce an interface like:

```ts
export interface Pet {
  id: number;
  tags: string[];
}
```

Similarly, you can create classes, type aliases, enums, etc., using `addClass`, `addTypeAlias`, and other factory methods. For example, to add a class with a property:

```ts
const classDec = sourceFile.addClass({ name: 'Container', isExported: true });
classDec.addProperty({ name: 'values', type: 'number[][]' }); // a 2D array property
```

In this case, the class `Container` will have a property `values: number[][]` (a nested array type). Under the hood, TS-Morph is just inserting the text `number[][]` as the type annotation. In general, providing a type as a string (e.g. `"OtherType[]"` or `"string | null"`) is the simplest way to specify complex types when generating code. TS-Morph will emit exactly that text in the output. For instance, in a real use-case, calling `addProperty({ name: "codes", type: "Code[]", initializer: "[]" })` creates a property `codes: Code[] = []` (see the [sourceFile.addTypeAlias / addProperty examples](https://ts-morph.com/details/type-aliases)).

> **Note:** TS-Morph does not currently offer a way to programmatically construct a `TypeNode` purely via its AST node classes in the structures API – instead, you supply the type as text or use a provided writer function. In fact, the `addTypeAlias` API requires the `type` to be a `string` or a `WriterFunction` (there’s no direct support for passing a pre-built type literal node) ([Type aliases documentation](https://ts-morph.com/details/type-aliases), [GitHub issue #1333](https://github.com/dsherret/ts-morph/issues/1333), [Stack Overflow discussion](https://stackoverflow.com/questions/75268501/how-create-typeliteral-without-string-writer-when-using-ts-morph)). This is by design – TS-Morph focuses on simplifying common tasks by allowing you to specify code as text, which it then inserts into the AST.

## Constructing Complex Types and Nested Structures

When dealing with **complex object types or initializers** (for example, an object type with many nested properties, or an array of object literals), the **canonical approach** in TS-Morph is to use writer functions or the utility _Writers_ provided by the library. This allows you to programmatically build the code string with proper formatting, since TS-Morph does not provide a deep builder API for object/array literals or type literals as first-class AST nodes via structures ([discussion on Writers and object types](https://github.com/dsherret/ts-morph/issues/622), [Stack Overflow example using `Writers.objectType`](https://stackoverflow.com/questions/75268501/how-create-typeliteral-without-string-writer-when-using-ts-morph)).

- **Type Literals (Object Types):** If you want to define a type alias for an object shape (as in an OpenAPI schema to TypeScript type conversion), you can use `Writers.objectType`. This helper constructs a writer for an inline object type. For example, to create an exported type alias `Car` for a type with a property `color: string`:

  ```ts
  import { Writers, WriterFunction } from 'ts-morph';
  sourceFile.addTypeAlias({
    name: 'Car',
    isExported: true,
    type: Writers.objectType({
      properties: [{ name: 'color', type: 'string' }],
    }),
  });
  ```

  Internally, `Writers.objectType` returns a `WriterFunction` that prints out an object literal type with the given properties (see [`Writers.objectType` in the ts-morph source/tests](https://github.com/dsherret/ts-morph/blob/latest/packages/ts-morph/src/structurePrinters/types/Writers.ts)). The resulting code would look like:

  ```ts
  export type Car = {
    color: string;
  };
  ```

  (Notice that TS-Morph handles adding the braces and semicolon for the property.) This writer-based approach is currently the **idiomatic way** to create type literals in TS-Morph, because there is no straightforward solution for constructing a TypeScript `TypeLiteral` node directly via the high-level TS-Morph structures API ([GitHub issue discussing type literals](https://github.com/dsherret/ts-morph/issues/1333), [Stack Overflow Q&A](https://stackoverflow.com/questions/75268501/how-create-typeliteral-without-string-writer-when-using-ts-morph)). Alternative lower-level solutions involve using the TypeScript factory API (for example, via `ts.factory.createTypeLiteralNode`), as shown in some community examples, but that means dropping down to the compiler API yourself and integrating with TS-Morph at the `compilerNode` level.

- **Nested Array Types:** As mentioned, you can represent array types by simply appending `[]` in the type string. For instance, if an OpenAPI schema defines a property as an array of arrays of integers, you can do `propertyStructure.type = "number[][]"` and TS-Morph will emit that correctly. If the array’s element type is a custom interface or type, use its name with `[]`. No special method is needed beyond providing the correct string. If you prefer a more strongly-typed abstraction over such strings, libraries like [`ts-morph-structures`](https://github.com/ajvincent/ts-morph-structures) model types as richer objects and then emit them as strings/writer functions compatible with TS-Morph ([Type structures guide](https://ajvincent.github.io/ts-morph-structures/guides/TypeStructures.html)), but under the hood TS-Morph still receives the type as a string or writer.

- **Object Literal Initializers:** If you need to initialize variables or class properties with object/array literals (e.g. a constant example object or a default array of items), TS-Morph allows you to use a writer function for the initializer. For example, suppose you want to generate:

  ```ts
  export const example = {
    id: 1,
    tags: ['a', 'b'],
  };
  ```

  You can achieve this by:

  ```ts
  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: 'const',
    declarations: [
      {
        name: 'example',
        initializer: (writer) => {
          writer.writeLine('{').writeLine(`  id: 1,`).writeLine(`  tags: ["a", "b"]`).write('}');
        },
      },
    ],
  });
  ```

  This writer callback gives you a `CodeBlockWriter` which honors the project’s indentation and newline settings. Using the writer is _“very useful because it will write code out using the indentation and newline settings of the project”_ and is generally easier to use for multi-line code ([Code writer documentation](https://ts-morph.com/manipulation/code-writer)). In other words, you can construct multi-line, nested structures (like object literals inside array literals) with proper formatting.

  There are also built-in **Writers** helpers for common patterns. For instance, `Writers.object({...})` can create an object literal expression from a JS object description, and patterns like `WriterFunctions.object` are shown in GitHub issues such as [“How to construct object literals”](https://github.com/dsherret/ts-morph/issues/622). For more complex literal shapes, you can compose these writer helpers or write your own writer callbacks.

  In cases of _nested arrays of objects_ (for example, an array property that should be initialized with an array of object literals), you can combine these approaches. One straightforward method is: set the property’s initializer to an empty array `[]` first, then get its AST node and use TS-Morph manipulation methods to add elements. For instance:

  ```ts
  const prop = classDec.addProperty({
    name: 'items',
    type: 'Item[]',
    initializer: '[]',
  });
  const arrLiteral = prop.getInitializerIfKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression);
  // Now arrLiteral represents the [] literal; we can add elements:
  arrLiteral.addElement("{ id: 1, name: 'A' }");
  arrLiteral.addElement("{ id: 2, name: 'B' }");
  ```

  _(Note: The exact methods to add elements may vary with TS-Morph versions; alternatively, one could use `insertText` or re-set the initializer via writer.)_ In practice, it’s often simpler to directly provide the array contents with a writer upfront, for example:

  ```ts
  initializer: (writer) => writer.write("[{ id: 1, name: 'A' }, { id: 2, name: 'B' }]");
  ```

  Both approaches result in an array of object literals in the generated code. The key point is that TS-Morph expects you to provide the literal structure as text or via a writer; it doesn’t abstract every level of syntax as a first-class object in the structures API. GitHub discussions like [“create a literal node expression and append to a file”](https://github.com/dsherret/ts-morph/issues/1238) reinforce that the recommended patterns are string/writer-based, with occasional fallbacks to the raw TypeScript factory functions when necessary.

## Reading and Transforming Types with TS-Morph

In addition to code generation, TS-Morph is powerful for _introspection_. If your architecture reads Zod schemas or existing TypeScript types to produce OpenAPI/JSON Schema, TS-Morph can parse those `.ts` files and let you navigate the AST or even directly query type information. For example, you can retrieve the type of a variable or property via `.getType()`, which gives a `Type` object with rich metadata. From the `Type`, you might call `.getText()` to get the type’s string representation or use methods like `.isArray()`, `.getProperties()`, `.getUnionTypes()`, `.getTupleElements()`, etc., to programmatically understand its structure ([Types documentation](https://ts-morph.com/details/types)). This means you could parse a Zod schema definition, get the corresponding TypeScript type of that schema (via `.getType()` on the Zod object’s variable initializer), and then recursively convert that into an OpenAPI Schema object by inspecting the type’s properties/unions (using TS-Morph’s type methods to detect shapes, arrays, union branches, etc.). Community Q&A such as [this Stack Overflow question about serializing type information with TS-Morph](https://stackoverflow.com/questions/76432132/how-to-use-ts-compiler-api-or-ts-morph-to-get-and-serialize-type-information) show how to walk a `Type` and turn it into a custom description tree.

In essence, TS-Morph lets you treat TypeScript code as data: you can **retrieve a node’s structure**, modify it or translate it, and ensure consistency across different representations. Articles like [“Getting Started With Handling TypeScript ASTs”](https://www.jameslmilner.com/posts/ts-ast-and-ts-morph-intro/) and similar blog posts illustrate how TS-Morph can be used to refactor or transform TypeScript code programmatically.

## Best Practices and Conclusion

When using TS-Morph to generate or transform code for complex specifications, keep in mind the following best practices:

- **Use the High-Level API:** Favor TS-Morph’s provided methods like `addInterface`, `addProperty`, `addTypeAlias`, etc., with structure objects. This leads to clearer code than manually constructing AST nodes. For simple types, passing a string is perfectly fine and canonical (e.g. `"Widget[]"` for an array of `Widget`). Use union (`"|"`), intersection (`"&"`), generics (`"MyType<T>"`), etc., in these strings as needed – TS-Morph will insert them verbatim. The documentation and examples repeatedly demonstrate this string-or-writer approach for types in structures (see for example the [Type alias docs](https://ts-morph.com/details/type-aliases) and the [ts-morph-structures type structures guide](https://ajvincent.github.io/ts-morph-structures/guides/TypeStructures.html)).

- **Leverage Writer Functions for Complex Code:** Whenever you need to embed non-trivial code (object literals, multi-line blocks, or type literals with many properties), use a writer function or the `Writers` utilities. This keeps your generation logic programmatic without resorting to brittle string concatenation. As the official documentation notes, writing with the provided code writer ensures the output respects your formatting settings (indentation, newlines) and is generally easier to reason about ([Code writer docs](https://ts-morph.com/manipulation/code-writer)). It also improves readability of your generator code by building the structure in a logical way (much like constructing a JSON).

- **AST as an information retrieval architecture using an AST representation of the data as the canonical source:** TS-Morph can act as the interchange layer between different spec formats. For example, you can parse an OpenAPI JSON into an AST by programmatically creating interfaces/types (using the schema definitions), then later modify or emit those to actual `.ts` files. Conversely, you can parse existing TypeScript (e.g. with Zod schemas or decorated classes) and use TS-Morph to read their types and JSDoc annotations to produce an OpenAPI spec. In both directions, the **AST is the source of truth**, meaning you avoid writing separate ad-hoc parsers for each format – instead, everything goes through the TypeScript AST. This tends to improve consistency because any change in the AST (the code model) will reflect in all outputs. TS-Morph’s own documentation emphasizes this “wrap the compiler and then manipulate via structures” style ([overview page](https://ts-morph.com/), [README on GitHub](https://github.com/dsherret/ts-morph)).

- **Performance and Memory:** When dealing with very large schemas or projects, be mindful of performance. TS-Morph keeps a lot of state in memory. Use project manipulation settings (like specifying `manipulationSettings` for indentation, newline kinds, etc.) to minimize re-format work, and prefer batch operations (e.g. `sourceFile.addInterfaces([...])`) when creating many nodes at once. Also, prefer a single `Project` instance if possible, and only emit when all changes are done to avoid redundant parsing/emitting cycles. The TS-Morph documentation and various GitHub issues and community posts include performance tips and note that emit/save are separate operations ([emitting docs](https://ts-morph.com/emitting), [source file saving docs](https://ts-morph.com/details/source-files)).

In summary, **the canonical usage of TS-Morph** for code generation tasks is to rely on its convenient _structures API_ for creating AST nodes, and to supplement that with code writers for any complex literals or nested structures. By doing so, you can cleanly generate TypeScript types (including those with nested arrays and object types) from OpenAPI or JSON schemas, and likewise read TypeScript definitions to generate other formats, all while keeping the transformations robust and maintainable. TS-Morph’s design choices (string-or-writer inputs for types and initializers) align with common use cases and ensure that you can express any TypeScript construct one way or another – even if it means writing out a few lines of code via a writer. By following these practices, you can let TS-Morph handle the heavy lifting of AST management and focus on the higher-level logic of your spec conversions, confident that the resulting code will be correct and idiomatic TypeScript.

---

### Selected External References

- [TS-Morph official documentation](https://ts-morph.com/)
- [ts-morph on npm](https://www.npmjs.com/package/ts-morph)
- [Type aliases in TS-Morph](https://ts-morph.com/details/type-aliases)
- [Types and type inspection](https://ts-morph.com/details/types)
- [Code writer documentation](https://ts-morph.com/manipulation/code-writer)
- [Emitting and saving files](https://ts-morph.com/emitting), [Source files docs](https://ts-morph.com/details/source-files)
- [GitHub issue: How to create a TypeLiteral?](https://github.com/dsherret/ts-morph/issues/1333)
- [GitHub issue: Constructing object literals](https://github.com/dsherret/ts-morph/issues/622)
- [GitHub issue: Create literal node expression and append to a file](https://github.com/dsherret/ts-morph/issues/1238)
- [Stack Overflow: Create TypeLiteral without string/writer in TS-Morph](https://stackoverflow.com/questions/75268501/how-create-typeliteral-without-string-writer-when-using-ts-morph)
- [Stack Overflow: Serialize type information with TS-Morph](https://stackoverflow.com/questions/76432132/how-to-use-ts-compiler-api-or-ts-morph-to-get-and-serialize-type-information)
- [ts-morph-structures project](https://github.com/ajvincent/ts-morph-structures) and [type structures guide](https://ajvincent.github.io/ts-morph-structures/guides/TypeStructures.html)
- [Intro article on TS-Morph and TypeScript ASTs](https://www.jameslmilner.com/posts/ts-ast-and-ts-morph-intro/)
- [TS-Morph GitHub repository](https://github.com/dsherret/ts-morph)
