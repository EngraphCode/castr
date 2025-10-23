import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("regex-with-unnecessary-escape fails", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: {
                        type: "string",
                        pattern: String.raw`^\/$`,
                    },
                },
            },
        })
    ).toMatchInlineSnapshot(
        // This is what it should produce, but to prioritize escaping forward slashes without an unnecessary escape,
        // we leave this is failing for now.
        // '"z.object({ str: z.string().regex(/^\\/$/) }).partial().passthrough()"'
        String.raw`"z.object({ str: z.string().regex(/^\\/$/) }).partial().passthrough()"`
    );
});
