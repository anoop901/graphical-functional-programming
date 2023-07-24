import FunctionCallBlock from "./FunctionCallBlock";
import IntegerLiteralBlock from "./IntegerLiteralBlock";
import ReferenceBlock from "./ReferenceBlock";

type Block = IntegerLiteralBlock | ReferenceBlock | FunctionCallBlock;
export default Block;
