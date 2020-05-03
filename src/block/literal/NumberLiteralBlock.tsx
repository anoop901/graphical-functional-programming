import LiteralBlock from "./LiteralBlock";

export default class NumberLiteralBlock extends LiteralBlock {
  constructor(
    public value: number,
  ) {
    super();
  }
}