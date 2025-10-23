import { describe, expect, it } from "vitest";

import { isPrimitiveType, type PrimitiveType } from "./utils.js";

describe("utils", () => {
    describe("isPrimitiveType", () => {
        it("should return true for string type", () => {
            expect(isPrimitiveType("string")).toBe(true);
        });

        it("should return true for number type", () => {
            expect(isPrimitiveType("number")).toBe(true);
        });

        it("should return true for integer type", () => {
            expect(isPrimitiveType("integer")).toBe(true);
        });

        it("should return true for boolean type", () => {
            expect(isPrimitiveType("boolean")).toBe(true);
        });

        it("should return true for null type", () => {
            expect(isPrimitiveType("null")).toBe(true);
        });

        it("should return false for object type", () => {
            expect(isPrimitiveType("object")).toBe(false);
        });

        it("should return false for array type", () => {
            expect(isPrimitiveType("array")).toBe(false);
        });

        it("should narrow type correctly", () => {
            const type: string = "string";
            if (isPrimitiveType(type)) {
                // Type should be narrowed to PrimitiveType
                const primitiveType: PrimitiveType = type;
                expect(primitiveType).toBe("string");
            }
        });

        it("should handle invalid types gracefully", () => {
            // @ts-expect-error - Testing runtime behavior with invalid input
            expect(isPrimitiveType("invalid")).toBe(false);
            // @ts-expect-error - Testing runtime behavior with invalid input
            expect(isPrimitiveType(undefined)).toBe(false);
        });
    });
});

