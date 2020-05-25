import FunctionBlock from "./FunctionBlock";

export default class DummyFunctionBlock extends FunctionBlock {
  constructor(
    public readonly numInputs: number,
    public readonly numOutputs: number
  ) {
    super();
  }
}
