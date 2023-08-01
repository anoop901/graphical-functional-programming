import { BlockBase } from "./Block";

export default interface ReferenceBlock extends BlockBase {
  type: "ReferenceBlock";
  name: string;
}

export function getDependenciesOfReferenceBlock(
  block: ReferenceBlock
): string[] {
  return [];
}
