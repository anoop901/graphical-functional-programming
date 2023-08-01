import { BlockBase } from "./Block";

export default interface ArrayBlock extends BlockBase {
  type: "ArrayBlock";
  elementBlockIds: string[];
}

export function getDependenciesOfArrayBlock(block: ArrayBlock): string[] {
  return block.elementBlockIds;
}
