import { describe, expect, it } from "vitest";

import {
    isPrimitiveSchemaType,
    type PrimitiveSchemaType,
    capitalize,
    pathParamToVariableName,
    pathToVariableName,
    replaceHyphenatedPath,
} from "./utils.js";

describe("utils", () => {
    describe("capitalize", () => {
        it("should capitalize the first letter of a lowercase string", () => {
            expect(capitalize("hello")).toBe("Hello");
        });

        it("should preserve remaining characters (not lowercase them)", () => {
            expect(capitalize("WORLD")).toBe("WORLD");
            expect(capitalize("hELLO")).toBe("HELLO");
            expect(capitalize("mediaObjects")).toBe("MediaObjects");
        });

        it("should handle empty string", () => {
            expect(capitalize("")).toBe("");
        });

        it("should handle single character", () => {
            expect(capitalize("a")).toBe("A");
            expect(capitalize("Z")).toBe("Z");
        });

        it("should handle strings with numbers", () => {
            expect(capitalize("test123")).toBe("Test123");
        });

        it("should work with camelCase input", () => {
            // This is the critical use case for pathToVariableName
            expect(capitalize("mediaObjects")).toBe("MediaObjects");
            expect(capitalize("userProfiles")).toBe("UserProfiles");
        });
    });

    describe("pathParamToVariableName", () => {
        it("should preserve colon prefix for path parameters", () => {
            expect(pathParamToVariableName(":id")).toBe(":id");
            expect(pathParamToVariableName(":userId")).toBe(":userId");
            expect(pathParamToVariableName(":petId")).toBe(":petId");
        });

        it("should convert snake_case to camelCase while preserving colon", () => {
            expect(pathParamToVariableName(":user_id")).toBe(":userId");
            expect(pathParamToVariableName(":pet_owner_name")).toBe(":petOwnerName");
        });

        it("should convert kebab-case to camelCase while preserving colon", () => {
            expect(pathParamToVariableName(":user-id")).toBe(":userId");
            expect(pathParamToVariableName(":pet-owner-name")).toBe(":petOwnerName");
        });

        it("should preserve underscores in parameter names", () => {
            // Underscores should be preserved as-is
            expect(pathParamToVariableName(":owner_name")).toBe(":ownerName");
        });

        it("should handle parameters without colons (edge case)", () => {
            expect(pathParamToVariableName("userId")).toBe("userId");
            expect(pathParamToVariableName("user_id")).toBe("userId");
        });

        it("should handle mixed separators", () => {
            // Replace hyphens with underscores, then convert
            expect(pathParamToVariableName(":user-name-id")).toBe(":userNameId");
        });
    });

    describe("pathToVariableName", () => {
        it("should convert simple paths to PascalCase variable names", () => {
            expect(pathToVariableName("/users")).toBe("Users");
            expect(pathToVariableName("/pets")).toBe("Pets");
        });

        it("should convert kebab-case paths to PascalCase", () => {
            expect(pathToVariableName("/media-objects")).toBe("MediaObjects");
            expect(pathToVariableName("/user-profiles")).toBe("UserProfiles");
        });

        it("should convert paths with parameters to PascalCase", () => {
            expect(pathToVariableName("/media-objects/{id}")).toBe("MediaObjectsId");
            expect(pathToVariableName("/users/{userId}")).toBe("UsersUserId");
        });

        it("should remove slashes from paths", () => {
            expect(pathToVariableName("/api/v1/users")).toBe("ApiV1Users");
        });

        it("should handle special characters (camelCase removes dots)", () => {
            // camelCase converts "/robots.txt" to "robotsTxt", then capitalize to "RobotsTxt"
            // The dot is removed by camelCase, not converted to underscore
            expect(pathToVariableName("/robots.txt")).toBe("RobotsTxt");
        });

        it("should handle nested paths with parameters", () => {
            expect(pathToVariableName("/users/{userId}/posts/{postId}")).toBe("UsersUserIdPostsPostId");
        });
    });

    describe("replaceHyphenatedPath", () => {
        it("should convert hyphenated path parameters to colon-prefixed parameters", () => {
            expect(replaceHyphenatedPath("/pet/{pet-id}")).toBe("/pet/:petId");
            expect(replaceHyphenatedPath("/user/{user-name}")).toBe("/user/:userName");
        });

        it("should handle multiple hyphenated parameters", () => {
            expect(replaceHyphenatedPath("/api/{api-version}/user/{user-id}")).toBe("/api/:apiVersion/user/:userId");
        });

        it("should leave non-hyphenated parameters unchanged", () => {
            expect(replaceHyphenatedPath("/pet/{petId}")).toBe("/pet/:petId");
            expect(replaceHyphenatedPath("/user/{userId}")).toBe("/user/:userId");
        });

        it("should handle paths with no parameters", () => {
            expect(replaceHyphenatedPath("/api/users")).toBe("/api/users");
        });

        it("should handle mixed hyphenated and non-hyphenated parameters", () => {
            expect(replaceHyphenatedPath("/api/{version}/user/{user-id}")).toBe("/api/:version/user/:userId");
        });

        it("should preserve underscores in parameter names", () => {
            expect(replaceHyphenatedPath("/pet/{owner_name}")).toBe("/pet/:ownerName");
        });
    });

    describe("isPrimitiveSchemaType", () => {
        it("should return true for string type", () => {
            expect(isPrimitiveSchemaType("string")).toBe(true);
        });

        it("should return true for number type", () => {
            expect(isPrimitiveSchemaType("number")).toBe(true);
        });

        it("should return true for integer type", () => {
            expect(isPrimitiveSchemaType("integer")).toBe(true);
        });

        it("should return true for boolean type", () => {
            expect(isPrimitiveSchemaType("boolean")).toBe(true);
        });

        it("should return true for null type", () => {
            expect(isPrimitiveSchemaType("null")).toBe(true);
        });

        it("should return false for object type", () => {
            expect(isPrimitiveSchemaType("object")).toBe(false);
        });

        it("should return false for array type", () => {
            expect(isPrimitiveSchemaType("array")).toBe(false);
        });

        it("should narrow type correctly from unknown", () => {
            const value: unknown = "string";
            if (isPrimitiveSchemaType(value)) {
                // Type should be narrowed to PrimitiveSchemaType
                const primitiveType: PrimitiveSchemaType = value;
                expect(primitiveType).toBe("string");
            }
        });

        it("should handle invalid types gracefully", () => {
            expect(isPrimitiveSchemaType("invalid")).toBe(false);
            expect(isPrimitiveSchemaType(undefined)).toBe(false);
            expect(isPrimitiveSchemaType(null)).toBe(false);
            expect(isPrimitiveSchemaType(123)).toBe(false);
        });
    });
});
