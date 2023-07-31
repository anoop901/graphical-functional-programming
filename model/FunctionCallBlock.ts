import { BlockBase } from "./Block";

export default interface FunctionCallBlock extends BlockBase {
  type: "FunctionCallBlock";
  functionBlockId: string;
  argumentBlockId: string;
}

export function getDependenciesOfFunctionCallBlock(
  block: FunctionCallBlock
): string[] {
  return [block.functionBlockId, block.argumentBlockId];
}
