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

export const getLayoutCalculator = getGenericBlockHandler<
  (dependenciesSizes: { width: number; height: number }[]) => {
    size: { width: number; height: number };
    dependenciesOffsets: { x: number; y: number }[];
  }
>({
  handleIntegerLiteralBlock: (block) => (dependencySizes) => ({
    size: { width: 40, height: 20 },
    dependenciesOffsets: [],
  }),
  handleFunctionCallBlock: (block) => (dependencySizes) => {
    const width =
      10 + dependencySizes[0].width + 20 + dependencySizes[1].width + 10;
    return {
      size: {
        width,
        height:
          Math.max(dependencySizes[0].height, dependencySizes[1].height) + 20,
      },
      dependenciesOffsets: [
        -width / 2 + 10 + dependencySizes[0].width / 2,
        -width / 2 +
          10 +
          dependencySizes[0].width +
          20 +
          dependencySizes[1].width / 2,
      ].map((x) => ({ x, y: 0 })),
    };
  },
  handleArrayBlock: (block) => (dependencySizes) => {
    const width =
      dependencySizes.map((size) => size.width).reduce((x, y) => x + y) +
      10 * (dependencySizes.length + 1);

    let leftX = -width / 2 + 10;
    const dependenciesOffsets = [];
    for (const dependencySize of dependencySizes) {
      const rightX = leftX + dependencySize.width;
      const x = (leftX + rightX) / 2;
      dependenciesOffsets.push({ x, y: 0 });
      leftX = rightX + 10;
    }
    return {
      size: {
        width,
        height: Math.max(...dependencySizes.map((size) => size.height)) + 20,
      },
      dependenciesOffsets,
    };
  },
  handleReferenceBlock: (block) => (dependencyLayouts) => ({
    size: { width: 80, height: 20 },
    dependenciesOffsets: [],
  }),
});
