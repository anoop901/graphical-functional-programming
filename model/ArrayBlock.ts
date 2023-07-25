export default interface ArrayBlock {
  type: "ArrayBlock";
  elementBlockIds: string[];
}

export function getDependenciesOfArrayBlock(block: ArrayBlock): string[] {
  return block.elementBlockIds;
}
