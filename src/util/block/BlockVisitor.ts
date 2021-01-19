import NumberLiteralBlock from './NumberLiteralBlock';
import FunctionBlock from './function/FunctionBlock';
import NumberInputBlock from './NumberInputBlock';
import NumberOutputBlock from './NumberOutputBlock';
import DefinitionBlock from './DefinitionBlock';
import ReferenceBlock from './ReferenceBlock';

export default interface BlockVisitor<R> {
  visitNumberLiteralBlock(block: NumberLiteralBlock): R;
  visitFunctionBlock(block: FunctionBlock): R;
  visitNumberInputBlock(block: NumberInputBlock): R;
  visitNumberOutputBlock(block: NumberOutputBlock): R;
  visitDefinitionBlock(block: DefinitionBlock): R;
  visitReferenceBlock(block: ReferenceBlock): R;
}
