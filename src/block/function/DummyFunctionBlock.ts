import FunctionBlock from "./FunctionBlock";
import React = require("react");

export default class DummyFunctionBlock extends FunctionBlock {
  constructor(
    public readonly numInputs: number,
    public readonly numOutputs: number
  ) {
    super();
  }
}
