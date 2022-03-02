import { createAction, createReducer } from "@reduxjs/toolkit";
import { EditorState } from "./editor";
import {
  blockInputIsUnconnected,
  generateInitialProgramState,
  ProgramState,
} from "./program";
import { MenuState } from "./menu";
import { Location, BlockId, ConnectionId } from "./types";
import { v4 as uuid } from "uuid";

interface RootState {
  editor: EditorState;
  program: ProgramState;
  menu: MenuState;
}

export const startDraggingBlock =
  createAction<{ blockId: BlockId; mouseLocation: Location }>(
    "startDraggingBlock"
  );
export const dragBlock = createAction<{ mouseLocation: Location }>("dragBlock");
export const closeMenu = createAction("closeMenu");
export const updateNewConnection = createAction<{ mouseLocation: Location }>(
  "updateNewConnection"
);
export const stopDraggingBlock = createAction("stopDraggingBlock");
export const stopDrawingNewConnection = createAction(
  "stopDrawingNewConnection"
);
export const makeEditorIdle = createAction("makeEditorIdle");
export const openMenuOnBackground = createAction<{ mouseLocation: Location }>(
  "openMenuOnBackground"
);
export const hoverBlockInput =
  createAction<{ blockId: BlockId; inputIndex: number }>("hoverBlockInput");
export const unhoverBlockInput = createAction("unhoverBlockInput");
export const hoverBlockOutput =
  createAction<{ blockId: BlockId; outputIndex: number }>("hoverBlockOutput");
export const unhoverBlockOutput = createAction("unhoverBlockOutput");
export const startDrawingNewConnection = createAction<{
  mouseLocation: Location;
  sourceBlockId: BlockId;
  sourceBlockOutputIndex: number;
}>("startDrawingNewConnection");
export const removeConnection =
  createAction<{ connectionId: ConnectionId }>("removeConnection");
export const createNumberLiteralBlock = createAction<{
  location: Location;
  value: number;
}>("createNumberLiteralBlock");

export const rootReducer = createReducer<RootState>(
  {
    editor: { mode: "idle" },
    program: generateInitialProgramState(),
    menu: { open: false },
  },
  (builder) =>
    builder
      .addCase(
        startDraggingBlock,
        (state, { payload: { blockId, mouseLocation } }) => {
          const blockLocation = state.program.blocks[blockId].location;
          state.editor = {
            mode: "drag",
            blockId,
            offsetFromMouse: {
              x: mouseLocation.x - blockLocation.x,
              y: mouseLocation.y - blockLocation.y,
            },
          };
        }
      )
      .addCase(dragBlock, (state, { payload: { mouseLocation } }) => {
        if (state.editor.mode !== "drag") {
          return;
        }
        state.program.blocks[state.editor.blockId].location.x =
          mouseLocation.x - state.editor.offsetFromMouse.x;
        state.program.blocks[state.editor.blockId].location.y =
          mouseLocation.y - state.editor.offsetFromMouse.y;
      })
      .addCase(closeMenu, (state) => {
        state.menu = { open: false };
      })
      .addCase(updateNewConnection, (state, { payload: { mouseLocation } }) => {
        if (state.editor.mode !== "drawNewConnection") {
          return;
        }
        state.editor.mouseLocation = mouseLocation;
      })
      .addCase(stopDraggingBlock, (state) => {
        if (state.editor.mode !== "drag") {
          return;
        }
        state.editor = { mode: "idle" };
      })
      .addCase(stopDrawingNewConnection, (state) => {
        if (state.editor.mode !== "drawNewConnection") {
          return;
        }
        if (
          state.editor.hoveredBlockInput !== undefined &&
          blockInputIsUnconnected(
            state.program,
            state.editor.hoveredBlockInput.blockId,
            state.editor.hoveredBlockInput.inputIndex
          )
        ) {
          state.program.connections[uuid()] = {
            sourceBlockId: state.editor.sourceBlockId,
            sourceBlockOutputIndex: state.editor.sourceBlockOutputIndex,
            destinationBlockId: state.editor.hoveredBlockInput.blockId,
            destinationBlockInputIndex:
              state.editor.hoveredBlockInput.inputIndex,
          };
        }
        state.editor = { mode: "idle" };
      })
      .addCase(makeEditorIdle, (state) => {
        state.editor = { mode: "idle" };
      })
      .addCase(
        openMenuOnBackground,
        (state, { payload: { mouseLocation } }) => {
          state.menu = {
            open: true,
            location: {
              x: mouseLocation.x - 2,
              y: mouseLocation.y - 4,
            },
          };
        }
      )
      .addCase(
        hoverBlockInput,
        (state, { payload: { blockId, inputIndex } }) => {
          if (state.editor.mode !== "drawNewConnection") {
            return;
          }
          state.editor.hoveredBlockInput = { blockId, inputIndex };
        }
      )
      .addCase(unhoverBlockInput, (state) => {
        if (state.editor.mode !== "drawNewConnection") {
          return;
        }
        delete state.editor.hoveredBlockInput;
      })
      .addCase(
        hoverBlockOutput,
        (state, { payload: { blockId, outputIndex } }) => {
          if (state.editor.mode !== "idle") {
            return;
          }
          state.editor.hoveredBlockOutput = { blockId, outputIndex };
        }
      )
      .addCase(unhoverBlockOutput, (state) => {
        if (state.editor.mode !== "idle") {
          return;
        }
        delete state.editor.hoveredBlockOutput;
      })
      .addCase(
        startDrawingNewConnection,
        (
          state,
          { payload: { mouseLocation, sourceBlockId, sourceBlockOutputIndex } }
        ) => {
          if (state.editor.mode === "idle") {
            state.editor = {
              mode: "drawNewConnection",
              sourceBlockId,
              sourceBlockOutputIndex,
              mouseLocation,
            };
          }
        }
      )
      .addCase(removeConnection, (state, { payload: { connectionId } }) => {
        delete state.program.connections[connectionId];
      })
      .addCase(
        createNumberLiteralBlock,
        (state, { payload: { location, value } }) => {
          state.program.blocks[uuid()] = {
            blockType: "numberLiteral",
            editing: false,
            location,
            value,
          };
        }
      )
);
