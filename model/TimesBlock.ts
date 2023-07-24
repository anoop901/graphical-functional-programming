import { BlockBase } from "./Block";

export default interface TimesBlock extends BlockBase {
  type: "TimesBlock";
  arg1BlockId: string;
  arg2BlockId: string;
}

export function getNumInputsForTimesBlock(): number {
  return 2;
}
