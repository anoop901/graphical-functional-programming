import NumberLiteralBlock from "./NumberLiteralBlock";
import FunctionBlock from "./function/FunctionBlock";
import NumberInputBlock from "./NumberInputBlock";
import NumberOutputBlock from "./NumberOutputBlock";

export default interface BlockVisitor<R> {
  visitNumberLiteralBlock(block: NumberLiteralBlock): R;
  visitFunctionBlock(block: FunctionBlock): R;
  visitNumberInputBlock(block: NumberInputBlock): R;
  visitNumberOutputBlock(block: NumberOutputBlock): R;
}
