import Block from "../block/Block";
import * as React from "react";
import NumberLiteralBlockInEditor, {
  getNumberLiteralBlockPartOffsets,
} from "./NumberLiteralBlockInEditor";
import FunctionBlockInEditor, {
  getFunctionBlockPartOffsets,
} from "./FunctionBlockInEditor";
import ProgramLayout from "../ProgramLayout";
import { BlockId } from "../Program";

export default function BlockInEditor({
  block,
  setBlock,
  onMouseDown,
  location,
}: {
  block: Block;
  setBlock: (block: Block) => void;
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
        setBlock={setBlock}
        onMouseDown={onMouseDown}
        location={location}
      />
    ),
  });
}

export interface BlockPartOffsets {
  getInputOffset(inputIndex: number): { dx: number; dy: number };
  getOutputOffset(outputIndex: number): { dx: number; dy: number };
}

function getBlockPartOffsets(block: Block): BlockPartOffsets {
  return block.accept({
    visitFunctionBlock: getFunctionBlockPartOffsets,
    visitNumberLiteralBlock: getNumberLiteralBlockPartOffsets,
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
  const offset = getBlockPartOffsets(block).getInputOffset(inputIndex);
  return {
    x: blockLocation.x + offset.dx,
    y: blockLocation.y + offset.dy,
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
  const offset = getBlockPartOffsets(block).getOutputOffset(outputIndex);
  return {
    x: blockLocation.x + offset.dx,
    y: blockLocation.y + offset.dy,
  };
}
