import FunctionBlock from "./FunctionBlock";

export default class DummyFunctionBlock extends FunctionBlock {
  public readonly name = "(placeholder)";

  constructor(
    public readonly numInputs: number,
    public readonly numOutputs: number
  ) {
    super();
  }

  evaluate(inputValues: number[]): number[] {
    return Array.from({ length: this.numOutputs }, () => 0);
  }
}
