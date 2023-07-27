export default interface IntegerLiteralBlock {
  type: "IntegerLiteralBlock";
  value: number;
}

export function getDependenciesOfIntegerLiteralBlock(
  block: IntegerLiteralBlock
): string[] {
  return [];
}
