import layoutIntervalsInSeries from "@/logic/geometry/layoutIntervalsInSeries";
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
    const { totalSize: height, intervals } = layoutIntervalsInSeries(
      [dependencySizes[1].height, dependencySizes[0].height],
      20,
      10
    );
    return {
      size: {
        width: Math.max(...dependencySizes.map(({ width }) => width)) + 20,
        height,
      },
      dependenciesOffsets: [intervals[1], intervals[0]].map(({ center }) => ({
        x: 0,
        y: center,
      })),
    };
  },
  handleArrayBlock: (block) => (dependencySizes) => {
    const { totalSize: width, intervals } = layoutIntervalsInSeries(
      dependencySizes.map((size) => size.width),
      10
    );
    return {
      size: {
        width,
        height: Math.max(...dependencySizes.map(({ height }) => height)) + 20,
      },
      dependenciesOffsets: intervals.map(({ center }) => ({
        x: center,
        y: 0,
      })),
    };
  },
  handleReferenceBlock: (block) => (dependencyLayouts) => ({
    size: { width: 80, height: 20 },
    dependenciesOffsets: [],
  }),
});
