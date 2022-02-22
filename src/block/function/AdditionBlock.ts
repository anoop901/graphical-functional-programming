import FunctionBlock from "./FunctionBlock";

export default class AdditionBlock extends FunctionBlock {
  public readonly name = "+";
  public readonly numInputs = 2;
  public readonly numOutputs = 1;

  evaluate(inputValues: number[]): number[] {
    const [x1, x2] = inputValues;
    return [x1 + x2];
  }
}
