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

export interface BlockBase {
  nested: boolean;
}

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
    const functionBlockSize = dependencySizes[0];
    const argumentBlockSize = dependencySizes[1];
    const { totalSize: height, intervals } = layoutIntervalsInSeries(
      [argumentBlockSize.height, functionBlockSize.height],
      20,
      10,
      false
    );
    const functionBlockInterval = intervals[1];
    const argumentBlockInterval = intervals[0];
    const width = Math.max(...dependencySizes.map(({ width }) => width)) + 20;
    return {
      size: {
        width,
        height,
      },
      dependenciesOffsets: [
        { blockSize: functionBlockSize, interval: functionBlockInterval },
        { blockSize: argumentBlockSize, interval: argumentBlockInterval },
      ].map(({ blockSize, interval }) => ({
        x: width / 2 - blockSize.width / 2,
        y: interval.left,
      })),
    };
  },
  handleArrayBlock: (block) => (dependencySizes) => {
    const { totalSize: width, intervals } = layoutIntervalsInSeries(
      dependencySizes.map((size) => size.width),
      10,
      10,
      false
    );
    const height =
      Math.max(...dependencySizes.map(({ height }) => height)) + 20;
    return {
      size: {
        width,
        height,
      },
      dependenciesOffsets: intervals.map(({ left }, index) => ({
        x: left,
        y: height / 2 - dependencySizes[index].height / 2,
      })),
    };
  },
  handleReferenceBlock: (block) => (dependencyLayouts) => ({
    size: { width: 80, height: 20 },
    dependenciesOffsets: [],
  }),
});
