import BlockVisitor from "./BlockVisitor";

export default abstract class Block {
  abstract get numInputs(): number;
  abstract get numOutputs(): number;
  abstract accept<R>(blockVisitor: BlockVisitor<R>): R;
}
