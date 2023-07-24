export default interface PlusBlock {
  type: "PlusBlock";
  arg1BlockId: string;
  arg2BlockId: string;
}

export function getNumInputsForPlusBlock(): number {
  return 2;
}
