import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts";
import { type Options, resolveConfig } from "prettier";
import { getZodClientTemplateContext } from "../src/template-context";
import { getHandlebars } from "../src/getHandlebars";
import { maybePretty } from "../src/maybePretty";

import fg from "fast-glob";

import { readFileSync } from "node:fs";
import * as path from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

let prettierConfig: Options | null;
const pkgRoot = process.cwd();

beforeAll(async () => {
    prettierConfig = await resolveConfig(path.resolve(pkgRoot, "../"));
});

describe("samples-generator", async () => {
    const samplesPath = path.resolve(pkgRoot, "../", String.raw`./samples/v3\.*/**/*.yaml`);
    const list = fg.sync([samplesPath]);

    const template = getHandlebars().compile(readFileSync("./src/templates/default.hbs", "utf8"));
    const resultByFile = {} as Record<string, string>;

    for (const docPath of list) {
        test(docPath, async () => {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const data = getZodClientTemplateContext(openApiDoc);

            const output = template({ ...data, options: { ...data.options, apiClientName: "api" } });
            const prettyOutput = await maybePretty(output, prettierConfig);
            const fileName = docPath.replace("yaml", "");

            // means the .ts file is valid
            expect(prettyOutput).not.toBe(output);
            resultByFile[fileName] = prettyOutput;
        });
    }

    test("results by file", () => {
        expect(
            Object.fromEntries(Object.entries(resultByFile).map(([key, value]) => [key.split("samples/").at(1), value]))
        ).toMatchInlineSnapshot(`
          {
              "v3.0/api-with-examples.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const endpoints = makeApi([
            {
              method: "get",
              path: "/",
              requestFormat: "json",
              response: z.void(),
            },
            {
              method: "get",
              path: "/v2",
              requestFormat: "json",
              response: z.void(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.0/callback-example.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const endpoints = makeApi([
            {
              method: "post",
              path: "/streams",
              description: \`subscribes a client to receive out-of-band data\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "callbackUrl",
                  type: "Query",
                  schema: z.string().url(),
                },
              ],
              response: z.object({ subscriptionId: z.string() }).passthrough(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.0/link-example.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const user = z
            .object({ username: z.string(), uuid: z.string() })
            .partial()
            .passthrough();
          const repository = z
            .object({ slug: z.string(), owner: user })
            .partial()
            .passthrough();
          const pullrequest = z
            .object({
              id: z.number().int(),
              title: z.string(),
              repository: repository,
              author: user,
            })
            .partial()
            .passthrough();

          export const schemas = {
            user,
            repository,
            pullrequest,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/2.0/repositories/:username",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: z.array(repository),
            },
            {
              method: "get",
              path: "/2.0/repositories/:username/:slug",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "slug",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: repository,
            },
            {
              method: "get",
              path: "/2.0/repositories/:username/:slug/pullrequests",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "slug",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "state",
                  type: "Query",
                  schema: z.enum(["open", "merged", "declined"]).optional(),
                },
              ],
              response: z.array(pullrequest),
            },
            {
              method: "get",
              path: "/2.0/repositories/:username/:slug/pullrequests/:pid",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "slug",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "pid",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: pullrequest,
            },
            {
              method: "post",
              path: "/2.0/repositories/:username/:slug/pullrequests/:pid/merge",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "slug",
                  type: "Path",
                  schema: z.string(),
                },
                {
                  name: "pid",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: z.void(),
            },
            {
              method: "get",
              path: "/2.0/users/:username",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: user,
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.0/petstore-expanded.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const NewPet = z
            .object({ name: z.string(), tag: z.string().optional() })
            .passthrough();
          const Pet = NewPet.and(z.object({ id: z.number().int() }).passthrough());
          const Error = z
            .object({ code: z.number().int(), message: z.string() })
            .passthrough();

          export const schemas = {
            NewPet,
            Pet,
            Error,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/pets",
              description: \`Returns all pets from the system that the user has access to
          Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.

          Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.
          \`,
              requestFormat: "json",
              parameters: [
                {
                  name: "tags",
                  type: "Query",
                  schema: z.array(z.string()).optional(),
                },
                {
                  name: "limit",
                  type: "Query",
                  schema: z.number().int().optional(),
                },
              ],
              response: z.array(Pet),
            },
            {
              method: "post",
              path: "/pets",
              description: \`Creates a new pet in the store. Duplicates are allowed\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Pet to add to the store\`,
                  type: "Body",
                  schema: NewPet,
                },
              ],
              response: Pet,
            },
            {
              method: "get",
              path: "/pets/:id",
              description: \`Returns a user based on a single ID, if the user does not have access to the pet\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "id",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Pet,
            },
            {
              method: "delete",
              path: "/pets/:id",
              description: \`deletes a single pet based on the ID supplied\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "id",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: z.void(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.0/petstore.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const Pet = z
            .object({
              id: z.number().int(),
              name: z.string(),
              tag: z.string().optional(),
            })
            .passthrough();
          const Pets = z.array(Pet);
          const Error = z
            .object({ code: z.number().int(), message: z.string() })
            .passthrough();

          export const schemas = {
            Pet,
            Pets,
            Error,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/pets",
              requestFormat: "json",
              parameters: [
                {
                  name: "limit",
                  type: "Query",
                  schema: z.number().int().optional(),
                },
              ],
              response: z.array(Pet),
            },
            {
              method: "post",
              path: "/pets",
              requestFormat: "json",
              response: z.void(),
            },
            {
              method: "get",
              path: "/pets/:petId",
              requestFormat: "json",
              parameters: [
                {
                  name: "petId",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: Pet,
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.1/non-oauth-scopes.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const endpoints = makeApi([
            {
              method: "get",
              path: "/users",
              requestFormat: "json",
              response: z.void(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "v3.1/webhook-example.": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const endpoints = makeApi([]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
          }
        `);
    });
});
