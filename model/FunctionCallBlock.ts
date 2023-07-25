export default interface FunctionCallBlock {
  type: "FunctionCallBlock";
  functionBlockId: string;
  argumentBlockId: string;
}

export function getDependenciesOfFunctionCallBlock(
  block: FunctionCallBlock
): string[] {
  return [block.functionBlockId, block.argumentBlockId];
}
