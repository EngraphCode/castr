import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas30";

import { isReferenceObject } from "openapi3-ts/oas30";
import { visitComposition, visitObjectProperties } from "./getOpenApiDependencyGraph.helpers.js";

export const getOpenApiDependencyGraph = (
    schemaRef: string[],
    getSchemaByRef: (ref: string) => SchemaObject | ReferenceObject
) => {
    const visitedsRefs: Record<string, boolean> = {};
    const refsDependencyGraph: Record<string, Set<string>> = {};

    const visit = (schema: SchemaObject | ReferenceObject, fromRef: string): void => {
        if (!schema) return;

        if (isReferenceObject(schema)) {
            if (!refsDependencyGraph[fromRef]) {
                refsDependencyGraph[fromRef] = new Set();
            }

            refsDependencyGraph[fromRef].add(schema.$ref);

            if (visitedsRefs[schema.$ref]) return;

            visitedsRefs[fromRef] = true;
            visit(getSchemaByRef(schema.$ref), schema.$ref);
            return;
        }

        if (schema.allOf) {
            visitComposition(schema.allOf, fromRef, visit);
            return;
        }

        if (schema.oneOf) {
            visitComposition(schema.oneOf, fromRef, visit);
            return;
        }

        if (schema.anyOf) {
            visitComposition(schema.anyOf, fromRef, visit);
            return;
        }

        if (schema.type === "array") {
            if (!schema.items) return;
            visit(schema.items, fromRef);
            return;
        }

        if (schema.type === "object" || schema.properties || schema.additionalProperties) {
            visitObjectProperties(schema, fromRef, visit);
        }
    };

    schemaRef.forEach((ref) => visit(getSchemaByRef(ref), ref));

    const deepDependencyGraph: Record<string, Set<string>> = {};
    const visitedsDeepRefs: Record<string, boolean> = {};
    schemaRef.forEach((ref) => {
        const deps = refsDependencyGraph[ref];
        if (!deps) return;
        if (!deepDependencyGraph[ref]) {
            deepDependencyGraph[ref] = new Set();
        }

        const visit = (dep: string) => {
            const currentGraph = deepDependencyGraph[ref];
            if (currentGraph) {
                currentGraph.add(dep);
            }
            if (refsDependencyGraph[dep] && ref !== dep) {
                refsDependencyGraph[dep].forEach((transitive: string) => {
                    if (visitedsDeepRefs[ref + "__" + transitive]) return;
                    visitedsDeepRefs[ref + "__" + transitive] = true;
                    visit(transitive);
                });
            }
        };

        deps.forEach((dep: string) => visit(dep));
    });

    return { refsDependencyGraph, deepDependencyGraph };
};
