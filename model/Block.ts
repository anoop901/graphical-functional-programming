import ArrayBlock, { getDependenciesOfArrayBlock } from "./ArrayBlock";
import BlockLayout from "./BlockLayout";
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

export const getDependenciesOfBlock = getGenericBlockHandler<string[]>({
  handleIntegerLiteralBlock: getDependenciesOfIntegerLiteralBlock,
  handleFunctionCallBlock: getDependenciesOfFunctionCallBlock,
  handleReferenceBlock: getDependenciesOfReferenceBlock,
  handleArrayBlock: getDependenciesOfArrayBlock,
});

// TODO: return value should contain the positions of the dependencies relative
// to the block, not the position of the block itself
export const getLayoutCalculator = getGenericBlockHandler<
  (dependencies: BlockLayout[]) => BlockLayout
>({
  handleIntegerLiteralBlock: (block) => (dependencyLayouts) => ({
    center: { x: 0, y: 0 },
    size: { width: 40, height: 20 },
  }),
  handleFunctionCallBlock: (block) => (dependencyLayouts) => ({
    center: { x: 0, y: 0 },
    size: {
      width:
        dependencyLayouts
          .map((layout) => layout.size.width)
          .reduce((x, y) => x + y) +
        (dependencyLayouts.length + 1) * 10,
      height:
        Math.max(...dependencyLayouts.map((layout) => layout.size.height)) + 20,
    },
  }),
  handleArrayBlock: (block) => (dependencyLayouts) => ({
    center: { x: 0, y: 0 },
    size: {
      width:
        dependencyLayouts
          .map((layout) => layout.size.width)
          .reduce((x, y) => x + y) +
        (dependencyLayouts.length + 1) * 10,
      height:
        Math.max(...dependencyLayouts.map((layout) => layout.size.height)) + 20,
    },
  }),
  handleReferenceBlock: (block) => (dependencyLayouts) => ({
    center: { x: 0, y: 0 },
    size: { width: 80, height: 20 },
  }),
});
