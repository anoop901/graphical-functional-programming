import Block from "./Block";
import BlockVisitor from "./BlockVisitor";

export default class NumberInputBlock extends Block {
  public readonly numInputs = 0;
  public readonly numOutputs = 1;
  constructor() {
    super();
  }

  accept<R>(blockVisitor: BlockVisitor<R>): R {
    return blockVisitor.visitNumberInputBlock(this);
  }
}
