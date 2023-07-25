import ArrayBlock, { getDependenciesOfArrayBlock } from "./ArrayBlock";
import FunctionCallBlock, {
  getDependenciesOfFunctionCallBlock,
} from "./FunctionCallBlock";
import IntegerLiteralBlock, {
  getDependenciesOfIntegerLiteralBlock,
} from "./IntegerLiteralBlock";
import ReferenceBlock, {
  getDependenciesOfReferenceBlock,
} from "./ReferenceBlock";

type Block =
  | IntegerLiteralBlock
  | ReferenceBlock
  | FunctionCallBlock
  | ArrayBlock;
export default Block;

interface BlockHandlers<R> {
  handleIntegerLiteralBlock(block: IntegerLiteralBlock): R;
  handleReferenceBlock(block: ReferenceBlock): R;
  handleFunctionCallBlock(block: FunctionCallBlock): R;
  handleArrayBlock(block: ArrayBlock): R;
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
      case "ArrayBlock":
        return handlers.handleArrayBlock(block);
    }
  };
}

const getDependenciesOfBlock = getGenericBlockHandler<string[]>({
  handleIntegerLiteralBlock: getDependenciesOfIntegerLiteralBlock,
  handleFunctionCallBlock: getDependenciesOfFunctionCallBlock,
  handleReferenceBlock: getDependenciesOfReferenceBlock,
  handleArrayBlock: getDependenciesOfArrayBlock,
});
