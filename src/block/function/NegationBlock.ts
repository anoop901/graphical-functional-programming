import FunctionBlock from "./FunctionBlock";

export default class NegationBlock extends FunctionBlock {
  public readonly name = "–";
  public readonly numInputs = 1;
  public readonly numOutputs = 1;

  evaluate(inputValues: number[]): number[] {
    const [x] = inputValues;
    return [-x];
  }
}
