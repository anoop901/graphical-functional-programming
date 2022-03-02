import Block from "../block/Block";
import * as React from "react";
import NumberLiteralBlockInEditor, {
  getNumberLiteralBlockPartOffsets,
} from "./NumberLiteralBlockInEditor";
import FunctionBlockInEditor, {
  getFunctionBlockPartOffsets,
} from "./FunctionBlockInEditor";
import "./BlockInEditor.css";
import NumberInputBlockInEditor, {
  getNumberInputBlockPartOffsets,
} from "./NumberInputBlockInEditor";
import NumberOutputBlockInEditor, {
  getNumberOutputBlockPartOffsets,
} from "./NumberOutputBlockInEditor";
import { Menu, MenuItem } from "@material-ui/core";
import DefinitionBlockInEditor, {
  getDefinitionBlockPartOffsets,
} from "./DefinitionBlockInEditor";
import ReferenceBlockInEditor, {
  getReferenceBlockPartOffsets,
} from "./ReferenceBlockInEditor";
import { BlockId } from "../reducers/types";
import { useSelector } from "react-redux";
import { useAppSelector } from "../hooks";
import AdditionBlock from "../block/function/AdditionBlock";

interface MenuState {
  location: { x: number; y: number };
}
function useMenu() {
  const [menuState, setMenuState] = React.useState<MenuState | undefined>(
    undefined
  );
  return {
    closeMenu: () => {
      setMenuState(undefined);
    },
    menuOpen: menuState !== undefined,
    anchorPosition:
      menuState !== undefined
        ? {
            top: menuState.location.y,
            left: menuState.location.x,
          }
        : undefined,
    handleContextMenu: (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
      e.preventDefault();
      setMenuState({
        location: {
          x: e.clientX - 2,
          y: e.clientY - 4,
        },
      });
    },
  };
}

export default function BlockInEditor({
  blockId,
  onMouseDown,
}: {
  blockId: BlockId;
  onMouseDown?: (e: React.MouseEvent) => void;
}): JSX.Element {
  const { anchorPosition, menuOpen, closeMenu, handleContextMenu } = useMenu();
  const block = useAppSelector((root) => root.program.blocks[blockId]);

  return (
    <g
      className="BlockInEditor"
      onContextMenu={(e) => {
        e.stopPropagation();
        handleContextMenu(e);
      }}
    >
      {((): JSX.Element => {
        switch (block.blockType) {
          case "function":
            return (
              <FunctionBlockInEditor
                block={new AdditionBlock()}
                onMouseDown={onMouseDown}
                location={block.location}
              />
            );
          case "definition":
            return (
              <DefinitionBlockInEditor
                block={block}
                onMouseDown={onMouseDown}
                location={location}
                setBlock={setBlock}
              />
            );
          case "numberDisplay":
            return (
              <NumberOutputBlockInEditor
                value={outputValue}
                onMouseDown={onMouseDown}
                location={location}
              />
            );
          case "numberLiteral":
            return (
              <NumberLiteralBlockInEditor
                block={block}
                setBlock={setBlock}
                onMouseDown={onMouseDown}
                location={location}
              />
            );
          case "reference":
            return (
              <ReferenceBlockInEditor
                block={block}
                onMouseDown={onMouseDown}
                location={location}
              />
            );
        }
      })()}
    </g>
  );
}

export interface BlockPartOffsets {
  getInputOffset(inputIndex: number): { dx: number; dy: number };
  getOutputOffset(outputIndex: number): { dx: number; dy: number };
}

function getBlockPartOffsets(block: Block): BlockPartOffsets {
  return block.accept({
    visitFunctionBlock: getFunctionBlockPartOffsets,
    visitNumberLiteralBlock: getNumberLiteralBlockPartOffsets,
    visitNumberInputBlock: getNumberInputBlockPartOffsets,
    visitNumberOutputBlock: getNumberOutputBlockPartOffsets,
    visitDefinitionBlock: getDefinitionBlockPartOffsets,
    visitReferenceBlock: getReferenceBlockPartOffsets,
  });
}

export function getBlockInputLocation(
  block: Block,
  inputIndex: number,
  blockLocation: { x: number; y: number }
): { x: number; y: number } {
  const offset = getBlockPartOffsets(block).getInputOffset(inputIndex);
  return {
    x: blockLocation.x + offset.dx,
    y: blockLocation.y + offset.dy,
  };
}

export function getBlockOutputLocation(
  block: Block,
  outputIndex: number,
  blockLocation: { x: number; y: number }
): { x: number; y: number } {
  const offset = getBlockPartOffsets(block).getOutputOffset(outputIndex);
  return {
    x: blockLocation.x + offset.dx,
    y: blockLocation.y + offset.dy,
  };
}
