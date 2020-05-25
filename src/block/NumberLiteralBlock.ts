import Block from "./Block";

export default class NumberLiteralBlock extends Block {
  public readonly numInputs = 0;
  public readonly numOutputs = 1;
  constructor(public value: number) {
    super();
  }
}
