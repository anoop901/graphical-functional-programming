import Block from "./Block";
import BlockVisitor from "./BlockVisitor";

export default class NumberLiteralBlock extends Block {
  public readonly numInputs = 0;
  public readonly numOutputs = 1;
  constructor(public value: number) {
    super();
  }

  accept<R>(blockVisitor: BlockVisitor<R>): R {
    return blockVisitor.visitNumberLiteralBlock(this);
  }

  evaluate(inputValues: number[]): number[] {
    return [this.value];
  }
}
