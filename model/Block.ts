import IntegerLiteralBlock, {
  getNumInputsForIntegerLiteralBlock,
} from "./IntegerLiteralBlock";
import MinusBlock, { getNumInputsForMinusBlock } from "./MinusBlock";
import PlusBlock, { getNumInputsForPlusBlock } from "./PlusBlock";
import TimesBlock from "./TimesBlock";

type Block = IntegerLiteralBlock | PlusBlock | MinusBlock | TimesBlock;
export default Block;
