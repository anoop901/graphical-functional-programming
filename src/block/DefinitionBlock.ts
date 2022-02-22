import Block from "./Block";
import BlockVisitor from "./BlockVisitor";

export default class DefinitionBlock extends Block {
  public readonly numInputs = 1;
  public readonly numOutputs = 0;
  constructor(public readonly name: string) {
    super();
  }

  accept<R>(blockVisitor: BlockVisitor<R>): R {
    return blockVisitor.visitDefinitionBlock(this);
  }

  evaluate(): number[] {
    return [];
  }
}
