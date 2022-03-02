import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import BlockInEditor, {
  getBlockOutputLocation,
  getBlockInputLocation,
} from "./BlockInEditor";
import ConnectionInEditor from "./ConnectionInEditor";
import { BlockId } from "../Program";
import { Map, set } from "immutable";
import Connection from "../Connection";
import { Menu, MenuItem } from "@material-ui/core";
import NumberLiteralBlock from "../block/NumberLiteralBlock";
import AdditionBlock from "../block/function/AdditionBlock";
import NegationBlock from "../block/function/NegationBlock";
import MultiplicationBlock from "../block/function/MultiplicationBlock";
import NumberInputBlock from "../block/NumberInputBlock";
import NumberOutputBlock from "../block/NumberOutputBlock";
import DefinitionBlock from "../block/DefinitionBlock";
import ReferenceBlock from "../block/ReferenceBlock";
import {
  closeMenu,
  createNumberLiteralBlock,
  dragBlock,
  hoverBlockInput,
  hoverBlockOutput,
  makeEditorIdle,
  openMenuOnBackground,
  removeConnection,
  startDraggingBlock,
  startDrawingNewConnection,
  stopDraggingBlock,
  stopDrawingNewConnection,
  unhoverBlockInput,
  unhoverBlockOutput,
  updateNewConnection,
} from "../reducers/root";
import { useAppDispatch, useAppSelector } from "../hooks";
import { blockInputIsUnconnected } from "../reducers/program";

export default function CodeEditor(): JSX.Element {
  // TODO: evaluate program and update displays when the program changes

  const dispatch = useAppDispatch();
  const editor = useAppSelector((root) => root.editor);
  const program = useAppSelector((root) => root.program);
  const menu = useAppSelector((root) => root.menu);

  const svgRef = React.useRef<SVGSVGElement>(null);

  return (
    <svg
      ref={svgRef}
      className="CodeEditor"
      onMouseMove={(e) => {
        if (svgRef.current !== null) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
          if (editor.mode === "drag") {
            dispatch(dragBlock({ mouseLocation }));
          }
          if (editor.mode === "drawNewConnection") {
            dispatch(updateNewConnection({ mouseLocation }));
          }
        }
      }}
      onMouseUp={() => {
        if (editor.mode === "drag") {
          dispatch(stopDraggingBlock());
        }
        if (editor.mode === "drawNewConnection") {
          dispatch(stopDrawingNewConnection());
        }
      }}
      onMouseLeave={() => {
        dispatch(makeEditorIdle());
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        dispatch(
          openMenuOnBackground({
            mouseLocation: { x: e.clientX, y: e.clientY },
          })
        );
      }}
    >
      {Object.entries(program.blocks).map(([blockId, block]) => {
        const blockLocation = block.location;
        return (
          <BlockInEditor
            // TODO: pass relevant information to BlockInEditor, and reimplement BlockInEditor to be able to use it
            key={blockId}
            blockId={blockId}
            onMouseDown={(e) => {
              if (svgRef.current !== null) {
                const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
                dispatch(startDraggingBlock({ blockId, mouseLocation }));
              }
            }}
          />
        );
      })}
      {Object.entries(program.connections).map(([connectionId, connection]) => {
        const sourceBlock = program.blocks[connection.sourceBlockId];
        const destBlock = program.blocks[connection.destinationBlockId];
        return (
          <ConnectionInEditor
            key={connectionId}
            sourceOutputLocation={sourceBlock.location} // TODO: get correct input location based on sourceBlock and connection.sourceBlockOutputIndex
            destInputLocation={destBlock.location} // TODO: get correct input location based on destBlock and connection.destinationBlockInputIndex
            removeConnection={() => {
              dispatch(removeConnection({ connectionId }));
            }}
          ></ConnectionInEditor>
        );
      })}
      {Object.entries(program.blocks).flatMap(([blockId, block]) => {
        const numInputs = 2; // TODO: get correct number of inputs from block
        const numOutputs = 2; // TODO: get correct number of outputs from block
        return [
          ...Array.from({ length: numInputs }).map((_, inputIndex) => {
            const inputLocation = block.location; // TODO: get correct input location based on block and input index
            const visible =
              editor.mode === "drawNewConnection" &&
              blockInputIsUnconnected(program, blockId, inputIndex);
            const emphasized =
              visible &&
              editor.hoveredBlockInput !== undefined &&
              editor.hoveredBlockInput.blockId === blockId &&
              editor.hoveredBlockInput.inputIndex === inputIndex;
            return (
              <circle
                onMouseEnter={() => {
                  dispatch(hoverBlockInput({ blockId, inputIndex }));
                }}
                onMouseLeave={() => {
                  dispatch(unhoverBlockInput());
                }}
                key={`${blockId}.in.${inputIndex}`}
                cx={inputLocation.x}
                cy={inputLocation.y}
                r={visible ? 20 : 10}
                fill={visible ? (emphasized ? "#0006" : "#0003") : "#0000"}
              />
            );
          }),
          ...Array.from({ length: numOutputs }).map((_, outputIndex) => {
            const outputLocation = block.location; // TODO: get correct output location based on block and input index
            const visible =
              editor.mode === "idle" &&
              editor.hoveredBlockOutput !== undefined &&
              editor.hoveredBlockOutput.blockId === blockId &&
              editor.hoveredBlockOutput.outputIndex === outputIndex;
            return (
              <circle
                onMouseEnter={() => {
                  dispatch(hoverBlockOutput({ blockId, outputIndex }));
                }}
                onMouseLeave={() => {
                  dispatch(unhoverBlockOutput());
                }}
                onMouseDown={(e) => {
                  if (svgRef.current !== null) {
                    const mouseLocation = mouseEventToSvgPoint(
                      e,
                      svgRef.current
                    );
                    dispatch(
                      startDrawingNewConnection({
                        mouseLocation,
                        sourceBlockId: blockId,
                        sourceBlockOutputIndex: outputIndex,
                      })
                    );
                  }
                }}
                key={`${blockId}.out.${outputIndex}`}
                cx={outputLocation.x}
                cy={outputLocation.y}
                r={visible ? 20 : 10}
                fill={visible ? "#0003" : "#0000"}
              />
            );
          }),
        ];
      })}
      {editor.mode === "drawNewConnection"
        ? editor.hoveredBlockInput !== undefined &&
          blockInputIsUnconnected(
            program,
            editor.hoveredBlockInput.blockId,
            editor.hoveredBlockInput.inputIndex
          )
          ? (() => {
              const sourceBlock = program.blocks[editor.sourceBlockId];
              const destBlock =
                program.blocks[editor.hoveredBlockInput.blockId];
              return (
                <ConnectionInEditor
                  sourceOutputLocation={sourceBlock.location} // TODO: get correct source output location based on sourceBlock, editor.sourceBlockOutputIndex
                  destInputLocation={destBlock.location} // TODO: get correct destination input location from destBlock, editor.hoveredBlockInput.inputIndex
                  removeConnection={() => {
                    // do nothing
                  }}
                  preview
                />
              );
            })()
          : (() => {
              const sourceBlock = program.blocks[editor.sourceBlockId];
              return (
                <ConnectionInEditor
                  sourceOutputLocation={sourceBlock.location} // TODO: get correct source output location based on sourceBlock, editor.sourceBlockOutputIndex
                  destInputLocation={editor.mouseLocation}
                  removeConnection={() => {
                    // do nothing
                  }}
                  preview
                />
              );
            })()
        : null}
      <Menu
        keepMounted
        open={menu.open}
        onClose={() => {
          dispatch(closeMenu());
        }}
        anchorReference="anchorPosition"
        anchorPosition={
          menu.open
            ? {
                top: menu.location.y,
                left: menu.location.x,
              }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            if (menu.open) {
              dispatch(
                createNumberLiteralBlock({ location: menu.location, value: 0 })
              );
            }
            dispatch(closeMenu());
          }}
        >
          Create number literal block
        </MenuItem>
        {/* TODO: add menu items for each type of block */}
      </Menu>
    </svg>
  );
}

/**
 * Returns the coordinates where the MouseEvent `event` occurred relative to the
 * coordinate system of `svgElem`.
 */
function mouseEventToSvgPoint(
  event: React.MouseEvent,
  svgElem: SVGSVGElement
): { x: number; y: number } {
  const eventPoint = svgElem.createSVGPoint();
  eventPoint.x = event.clientX;
  eventPoint.y = event.clientY;
  const screenCTM = svgElem.getScreenCTM();
  if (screenCTM === null) {
    throw new Error("getScreenCTM() returned null");
  }
  const svgPoint = eventPoint.matrixTransform(screenCTM.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
}
