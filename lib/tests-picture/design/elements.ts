/**
 * The elements of the prototype, named, found by the compiler.
 *
 * An element is a type of `model.ts`, one of its properties, or one member of a union of
 * objects told apart by a literal: `ObjectPart`, `ObjectPart.rest`, `Shape[when]`,
 * `Shape[rest-of].keys`. The coverage map names elements, and this is how a name in it
 * is known to be real.
 */

import { fileURLToPath } from 'node:url';

import { Node, Project, type TypeElementMemberedNode, type TypeNode } from 'ts-morph';

/** The literal property that tells a member of a union from the others, if it has one. */
function variantOf(members: TypeElementMemberedNode): string | undefined {
  for (const property of members.getProperties()) {
    const type = property.getType();
    if (type.isStringLiteral()) {
      return String(type.getLiteralValue());
    }
  }
  return undefined;
}

function ofUnion(owner: string, type: TypeNode): readonly string[] {
  const members = Node.isUnionTypeNode(type) ? type.getTypeNodes() : [type];
  return members.flatMap((member) => {
    if (!Node.isTypeLiteral(member)) {
      return [];
    }
    const variant = variantOf(member);
    const at = variant === undefined ? owner : `${owner}[${variant}]`;
    return [at, ...member.getProperties().map((property) => `${at}.${property.getName()}`)];
  });
}

/**
 * Names every element of the prototype's types.
 */
export function elements(): ReadonlySet<string> {
  const project = new Project({ compilerOptions: { strict: true } });
  const file = project.addSourceFileAtPath(fileURLToPath(new URL('model.ts', import.meta.url)));
  const names = [
    ...file
      .getInterfaces()
      .flatMap((one) => [
        one.getName(),
        ...one.getProperties().map((property) => `${one.getName()}.${property.getName()}`),
      ]),
    ...file
      .getTypeAliases()
      .flatMap((one) => [one.getName(), ...ofUnion(one.getName(), one.getTypeNodeOrThrow())]),
  ];
  return new Set(names);
}
