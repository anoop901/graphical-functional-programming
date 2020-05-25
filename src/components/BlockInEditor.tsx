import Block from "../block/Block";
import * as React from "react";
import NumberLiteralBlockInEditor, {
  getNumberLiteralBlockInputRelativeLocation,
  getNumberLiteralBlockOutputRelativeLocation,
} from "./NumberLiteralBlockInEditor";
import FunctionBlockInEditor, {
  getFunctionBlockInputRelativeLocation,
  getFunctionBlockOutputRelativeLocation,
} from "./FunctionBlockInEditor";
import ProgramLayout from "../ProgramLayout";
import { BlockId } from "../Program";

export default function BlockInEditor({
  block,
  onMouseDown,
  location,
}: {
  block: Block;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  return block.accept({
    // eslint-disable-next-line react/display-name
    visitFunctionBlock: (block) => (
      <FunctionBlockInEditor
        block={block}
        onMouseDown={onMouseDown}
        location={location}
      />
    ),
    // eslint-disable-next-line react/display-name
    visitNumberLiteralBlock: (block) => (
      <NumberLiteralBlockInEditor
        block={block}
        onMouseDown={onMouseDown}
        location={location}
      />
    ),
  });
}

export function getBlockInputLocation(
  blockId: BlockId,
  inputIndex: number,
  programLayout: ProgramLayout
): { x: number; y: number } {
  const block = programLayout.program.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`block id ${blockId} doesn't exist in program`);
  }
  const blockLocation = programLayout.getBlockLocation(blockId);

  const relativeLocation = block.accept({
    visitFunctionBlock: (block) =>
      getFunctionBlockInputRelativeLocation(block, inputIndex),
    visitNumberLiteralBlock: () => getNumberLiteralBlockInputRelativeLocation(),
  });

  return {
    x: blockLocation.x + relativeLocation.x,
    y: blockLocation.y + relativeLocation.y,
  };
}

export function getBlockOutputLocation(
  blockId: BlockId,
  outputIndex: number,
  programLayout: ProgramLayout
): { x: number; y: number } {
  const block = programLayout.program.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`block id ${blockId} doesn't exist in program`);
  }
  const blockLocation = programLayout.getBlockLocation(blockId);

  const relativeLocation = block.accept({
    visitFunctionBlock: (block) =>
      getFunctionBlockOutputRelativeLocation(block, outputIndex),
    visitNumberLiteralBlock: (block) =>
      getNumberLiteralBlockOutputRelativeLocation(block, outputIndex),
  });

  return {
    x: blockLocation.x + relativeLocation.x,
    y: blockLocation.y + relativeLocation.y,
  };
}
