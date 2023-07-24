import FunctionCallBlock from "./FunctionCallBlock";
import IntegerLiteralBlock from "./IntegerLiteralBlock";
import ReferenceBlock from "./ReferenceBlock";

type Block = IntegerLiteralBlock | ReferenceBlock | FunctionCallBlock;
export default Block;

interface BlockHandlers<R> {
  handleIntegerLiteralBlock(block: IntegerLiteralBlock): R;
  handleReferenceBlock(block: ReferenceBlock): R;
  handleFunctionCallBlock(block: FunctionCallBlock): R;
}

function getGenericBlockHandler<R>(
  handlers: BlockHandlers<R>
): (block: Block) => R {
  return (block: Block) => {
    switch (block.type) {
      case "IntegerLiteralBlock":
        return handlers.handleIntegerLiteralBlock(block);
      case "ReferenceBlock":
        return handlers.handleReferenceBlock(block);
      case "FunctionCallBlock":
        return handlers.handleFunctionCallBlock(block);
    }
  };
}
