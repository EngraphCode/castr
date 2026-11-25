/**
 * Every place the prototype's types hold a string, found by the compiler.
 *
 * A string in the model is either free text, a name its source chose, or text in a
 * grammar some specification defines. The last kind is what the specification forbids
 * without an exception its owner approves, so each string must be listed with its
 * reason, and a string nobody listed must fail a check. This module finds them: it reads
 * the types of `model.ts` through the compiler and names each property that can hold a
 * string, as text itself or as the key or member of a list, set or map.
 */

import { fileURLToPath } from 'node:url';

import { Node, Project, type PropertySignature, type Type } from 'ts-morph';

function holdsString(type: Type): boolean {
  if (type.isString()) {
    return true;
  }
  if (type.isUnion()) {
    return type.getUnionTypes().some((member) => holdsString(member));
  }
  const element = type.getArrayElementType();
  if (element !== undefined) {
    return holdsString(element);
  }
  // A set or a map of strings; a named object type is its own entry, not this one's.
  return type.getTypeArguments().some((argument) => argument.isString());
}

/** The literal that tells one member of a union of objects from another, if it has one. */
function variantOf(property: PropertySignature): string | undefined {
  const literal = property.getParentIfKind(property.getParent().getKind());
  const siblings = Node.isTypeLiteral(literal) ? literal.getProperties() : [];
  for (const sibling of siblings) {
    const type = sibling.getType();
    if (sibling !== property && type.isStringLiteral()) {
      return String(type.getLiteralValue());
    }
  }
  return undefined;
}

function nameOf(property: PropertySignature): string {
  const parts = [property.getName()];
  const variant = variantOf(property);
  for (const ancestor of property.getAncestors()) {
    if (Node.isPropertySignature(ancestor)) {
      parts.unshift(ancestor.getName());
    }
    if (Node.isInterfaceDeclaration(ancestor) || Node.isTypeAliasDeclaration(ancestor)) {
      const owner = ancestor.getName();
      const at = parts.length > 1 || variant === undefined ? owner : `${owner}[${variant}]`;
      return [at, ...parts].join('.');
    }
  }
  throw new Error(`the property ${property.getName()} is in no declaration`);
}

/**
 * Names every property of the prototype's types that can hold a string, sorted.
 */
export function stringLeaves(): readonly string[] {
  const project = new Project({ compilerOptions: { strict: true } });
  const file = project.addSourceFileAtPath(fileURLToPath(new URL('model.ts', import.meta.url)));
  const names = file
    .getDescendants()
    .filter((node) => Node.isPropertySignature(node))
    .filter((property) => holdsString(property.getType()))
    .map((property) => nameOf(property));
  return [...new Set(names)].sort((left, right) => left.localeCompare(right, 'en'));
}
