import Block from "../Block";

export default abstract class LiteralBlock extends Block {
  public readonly numInputs = 0;
  public readonly numOutputs = 1;
}
