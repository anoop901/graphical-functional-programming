import FunctionBlock from "./FunctionBlock";

export default class MultiplicationBlock extends FunctionBlock {
  public readonly name = "×";
  public readonly numInputs = 2;
  public readonly numOutputs = 1;

  constructor() {
    super();
  }
}
