import type { SchemaObject } from "openapi3-ts";
import { capitalize, kebabToCamel, snakeToCamel } from "pastable/server";
import { match, P } from "ts-pattern";

export const asComponentSchema = (name: string) => `#/components/schemas/${name}`;

export function normalizeString(text: string) {
    const prefixed = prefixStringStartingWithNumberIfNeeded(text);
    return prefixed
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replaceAll(/\s+/g, "_") // Replace spaces with _
        .replaceAll(/-+/g, "_") // Replace - with _
        .replaceAll(/[^\w-]+/g, "_") // Remove all non-word chars
        .replaceAll(/--+/g, "-"); // Replace multiple - with single -
}

export const wrapWithQuotesIfNeeded = (str: string) => {
    if (/^[a-zA-Z]\w*$/.test(str)) {
        return str;
    }

    return `"${str}"`;
};

const prefixStringStartingWithNumberIfNeeded = (str: string) => {
    const firstAsNumber = Number(str[0]);
    if (typeof firstAsNumber === "number" && !Number.isNaN(firstAsNumber)) {
        return "_" + str;
    }

    return str;
};

const pathParamWithBracketsRegex = /({\w+})/g;
const wordPrecededByNonWordCharacter = /[^\w-]+/g;

export const pathParamToVariableName = (name: string) => {
    // Replace all underscores with # to preserve them when doing snakeToCamel
    const preserveUnderscore = name.replaceAll("_", "#");
    return snakeToCamel(preserveUnderscore.replaceAll("-", "_")).replaceAll("#", "_");
};

const matcherRegex = /{(\b\w+(?:-\w+)*\b)}/g;
export const replaceHyphenatedPath = (path: string) => {
    const matches = path.match(matcherRegex);
    if (matches === null) {
        return path.replaceAll(matcherRegex, ":$1");
    }

    matches.forEach((match) => {
        const replacement = pathParamToVariableName(match.replaceAll(matcherRegex, ":$1"));
        path = path.replaceAll(match, replacement);
    });
    return path;
};

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string) =>
    capitalize(kebabToCamel(path).replaceAll("/", "")) // /media-objects/{id} -> MediaObjects{id}
        .replaceAll(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1))) // {id} -> Id
        .replaceAll(wordPrecededByNonWordCharacter, "_"); // "/robots.txt" -> "/robots_txt"

type SingleType = Exclude<SchemaObject["type"], unknown[] | undefined>;
export const isPrimitiveType = (type: SingleType): type is PrimitiveType =>
    primitiveTypeList.includes(type as PrimitiveType);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
export type PrimitiveType = (typeof primitiveTypeList)[number];

export const escapeControlCharacters = (str: string): string => {
    return str
        .replaceAll("\t", String.raw`\t`) // U+0009
        .replaceAll("\n", String.raw`\n`) // U+000A
        .replaceAll("\r", String.raw`\r`) // U+000D
        // eslint-disable-next-line no-control-regex, sonarjs/no-control-regex
        .replaceAll(/([\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF])/g, (_m, p1: string) => {
            const codePoint = p1.codePointAt(0);
            if (codePoint === undefined) return "";
            const dec: number = codePoint;
            const hex: string = dec.toString(16);
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            if (dec <= 0xff) return `\\x${`00${hex}`.slice(-2)}`;
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            return `\\u${`0000${hex}`.slice(-4)}`;
        })
        .replaceAll("/", String.raw`\/`);
};

export const toBoolean = (value: undefined | string | boolean, defaultValue: boolean) =>
    match(value)
        .with(P.string.regex(/^false$/i), false, () => false)
        .with(P.string.regex(/^true$/i), true, () => true)
        .otherwise(() => defaultValue);
