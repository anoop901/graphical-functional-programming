import { BlockBase } from "./Block";

export default interface IntegerLiteralBlock extends BlockBase {
  type: "IntegerLiteralBlock";
  value: number;
}

export function getDependenciesOfIntegerLiteralBlock(
  block: IntegerLiteralBlock
): string[] {
  return [];
}
