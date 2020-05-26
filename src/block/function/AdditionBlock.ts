import FunctionBlock from "./FunctionBlock";

export default class AdditionBlock extends FunctionBlock {
  public readonly name = "+";
  public readonly numInputs = 2;
  public readonly numOutputs = 1;

  constructor() {
    super();
  }
}
