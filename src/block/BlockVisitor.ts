import NumberLiteralBlock from "./NumberLiteralBlock";
import FunctionBlock from "./function/FunctionBlock";
import NumberInputBlock from "./NumberInputBlock";

export default interface BlockVisitor<R> {
  visitNumberLiteralBlock(block: NumberLiteralBlock): R;
  visitFunctionBlock(block: FunctionBlock): R;
  visitNumberInputBlock(block: NumberInputBlock): R;
}
