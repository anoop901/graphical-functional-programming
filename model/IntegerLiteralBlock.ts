export default interface IntegerLiteralBlock {
  type: "IntegerLiteralBlock";
  value: number;
}

export function getNumInputsForIntegerLiteralBlock(): number {
  return 0;
}
