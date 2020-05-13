import LiteralBlock from "./LiteralBlock";
import * as React from "react";

export default class NumberLiteralBlock extends LiteralBlock {
  constructor(public value: number) {
    super();
  }
}
