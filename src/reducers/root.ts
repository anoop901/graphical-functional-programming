import { createAction, createReducer } from "@reduxjs/toolkit";
import { EditorState } from "./editor";
import { generateInitialProgramState, ProgramState } from "./program";
import { MenuState } from "./menu";
import { Location, BlockId } from "./types";

interface RootState {
  editor: EditorState;
  program: ProgramState;
  menu: MenuState;
}

const startDraggingBlock =
  createAction<{ blockId: BlockId; mouseLocation: Location }>(
    "startDraggingBlock"
  );

export const rootReducer = createReducer<RootState>(
  {
    editor: { mode: "idle" },
    program: generateInitialProgramState(),
    menu: { open: false },
  },
  (builder) =>
    builder.addCase(
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
);
