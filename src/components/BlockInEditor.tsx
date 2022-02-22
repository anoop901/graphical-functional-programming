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
import DefinitionBlock from "../block/DefinitionBlock";
import ReferenceBlockInEditor, {
  getReferenceBlockPartOffsets,
} from "./ReferenceBlockInEditor";

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
  block,
  setBlock,
  removeBlock,
  onMouseDown,
  location,
  inputValue,
  setInputValue,
  outputValue,
}: {
  block: Block;
  setBlock: (block: Block) => void;
  removeBlock: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
  inputValue: number;
  setInputValue: (value: number) => void;
  outputValue: number | null;
}): JSX.Element {
  const { anchorPosition, menuOpen, closeMenu, handleContextMenu } = useMenu();
  return (
    <g
      className="BlockInEditor"
      onContextMenu={(e) => {
        e.stopPropagation();
        handleContextMenu(e);
      }}
    >
      {block.accept({
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
        // eslint-disable-next-line react/display-name
        visitNumberInputBlock: () => (
          <NumberInputBlockInEditor
            value={inputValue}
            setValue={setInputValue}
            onMouseDown={onMouseDown}
            location={location}
          />
        ),
        // eslint-disable-next-line react/display-name
        visitNumberOutputBlock: () => (
          <NumberOutputBlockInEditor
            value={outputValue}
            onMouseDown={onMouseDown}
            location={location}
          />
        ),
        // eslint-disable-next-line react/display-name
        visitDefinitionBlock: (block) => (
          <DefinitionBlockInEditor
            block={block}
            onMouseDown={onMouseDown}
            location={location}
            setBlock={setBlock}
          />
        ),
        // eslint-disable-next-line react/display-name
        visitReferenceBlock: (block) => (
          <ReferenceBlockInEditor
            block={block}
            onMouseDown={onMouseDown}
            location={location}
          />
        ),
      })}
      <Menu
        open={menuOpen}
        onClose={closeMenu}
        anchorPosition={anchorPosition}
        anchorReference="anchorPosition"
      >
        <MenuItem
          onClick={() => {
            removeBlock();
            closeMenu();
          }}
        >
          Remove
        </MenuItem>
      </Menu>
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
