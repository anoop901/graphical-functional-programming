export default abstract class Block {
  abstract get numInputs(): number;
  abstract get numOutputs(): number;
}
