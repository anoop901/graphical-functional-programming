export default interface ReferenceBlock {
  type: "ReferenceBlock";
  name: string;
}

export function getDependenciesOfReferenceBlock(
  block: ReferenceBlock
): string[] {
  return [];
}
