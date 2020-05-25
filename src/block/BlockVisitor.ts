import NumberLiteralBlock from "./NumberLiteralBlock";
import FunctionBlock from "./function/FunctionBlock";

export default interface BlockVisitor<R> {
  visitNumberLiteralBlock(block: NumberLiteralBlock): R;
  visitFunctionBlock(block: FunctionBlock): R;
}
