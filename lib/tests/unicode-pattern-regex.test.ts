import { getZodSchema } from "../src";
import { expect, test } from "vitest";
import { getZodChain } from "../src/openApiToZod";
import { type SchemaObject } from "openapi3-ts";

test("unicode-pattern-regex", () => {
    const schema: SchemaObject = {
        type: "string",
        pattern: String.raw`\p{L}+`,
    };
    const schemaWithSlashes: SchemaObject = {
        type: "string",
        pattern: String.raw`/\p{L}+/`,
    };
    const schemaWithComplexUnicodePattern: SchemaObject = {
        type: "string",
        pattern: String.raw`$|^[\p{L}\d]+[\p{L}\d\s.&()\*'',-;#]*|$`,
    };
    const schemaWithSlashU: SchemaObject = {
        type: "string",
        pattern: String.raw`\u{1F600}+`,
    };
    expect(getZodSchema({ schema: schema }) + getZodChain({ schema })).toMatchInlineSnapshot(
        String.raw`"z.string().regex(/\p{L}+/u).optional()"`
    );
    expect(
        getZodSchema({ schema: schemaWithSlashes }) + getZodChain({ schema: schemaWithSlashes })
    ).toMatchInlineSnapshot(String.raw`"z.string().regex(/\p{L}+/u).optional()"`);
    expect(
        getZodSchema({ schema: schemaWithComplexUnicodePattern }) +
            getZodChain({ schema: schemaWithComplexUnicodePattern })
    ).toMatchInlineSnapshot(String.raw`"z.string().regex(/$|^[\p{L}\d]+[\p{L}\d\s.&()\*'',-;#]*|$/u).optional()"`);
    expect(
        getZodSchema({ schema: schemaWithSlashU }) + getZodChain({ schema: schemaWithSlashU })
    ).toMatchInlineSnapshot(String.raw`"z.string().regex(/\u{1F600}+/u).optional()"`);
});
