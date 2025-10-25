import type { OpenAPIObject, SchemaObject } from "openapi3-ts/oas30";
import { get } from "lodash-es";

import { normalizeString } from "./utils.js";

const autocorrectRef = (ref: string) => (ref[1] === "/" ? ref : "#/" + ref.slice(1));

/**
 * Type guard to check if a value is a Record<string, SchemaObject>
 */
function isSchemaRecord(value: unknown): value is Record<string, SchemaObject> {
    const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
    if (!isObject) return false;

    // For values in components/schemas, check they're objects (not arrays, not primitives)
    const values = Object.values(value);
    return values.every((val) => val !== null && typeof val === "object" && !Array.isArray(val));
}

type RefInfo = {
    ref: string;
    name: string;
    normalized: string;
};

export const makeSchemaResolver = (doc: OpenAPIObject) => {
    // both used for debugging purpose
    // eslint-disable-next-line sonarjs/no-unused-collection
    const nameByRef = new Map<string, string>();
    // eslint-disable-next-line sonarjs/no-unused-collection
    const refByName = new Map<string, string>();

    const byRef = new Map<string, RefInfo>();
    const byNormalized = new Map<string, RefInfo>();

    const getSchemaByRef = (ref: string) => {
        // #components -> #/components
        const correctRef = autocorrectRef(ref);
        const split = correctRef.split("/");

        // "#/components/schemas/Something.jsonld" -> #/components/schemas
        const path = split.slice(1, -1).join("/");
        const retrieved: unknown = get(doc, path.replace("#/", "").replace("#", "").replaceAll("/", "."));
        const map: Record<string, SchemaObject> = isSchemaRecord(retrieved) ? retrieved : {};

        // "#/components/schemas/Something.jsonld" -> "Something.jsonld"
        const name = split.at(-1);
        if (!name) {
            throw new Error(`Invalid $ref: ${ref} (no name found in split path)`);
        }
        const normalized = normalizeString(name);

        nameByRef.set(correctRef, normalized);
        refByName.set(normalized, correctRef);

        const infos = { ref: correctRef, name, normalized };
        byRef.set(infos.ref, infos);
        byNormalized.set(infos.normalized, infos);

        // doc.components.schemas["Something.jsonld"]
        const schema = map[name];
        if (!schema) {
            throw new Error(`Schema not found for $ref: ${ref}`);
        }
        return schema;
    };

    return {
        getSchemaByRef,
        resolveRef: (ref: string) => {
            const resolved = byRef.get(autocorrectRef(ref));
            if (!resolved) {
                throw new Error(`Unable to resolve $ref: ${ref}`);
            }
            return resolved;
        },
        resolveSchemaName: (normalized: string) => {
            const resolved = byNormalized.get(normalized);
            if (!resolved) {
                throw new Error(`Unable to resolve schema name: ${normalized}`);
            }
            return resolved;
        },
    };
};

export type DocumentResolver = ReturnType<typeof makeSchemaResolver>;
