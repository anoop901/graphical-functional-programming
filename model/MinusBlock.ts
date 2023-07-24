export default interface MinusBlock {
  type: "MinusBlock";
  arg1BlockId: string;
  arg2BlockId: string;
}

export function getNumInputsForMinusBlock(): number {
  return 2;
}
