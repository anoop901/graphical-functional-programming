import { createReducer } from "@reduxjs/toolkit";
import { EditorState } from "./editor";
import { generateInitialProgramState, ProgramState } from "./program";
import { MenuState } from "./menu";

interface RootState {
  editor: EditorState;
  program: ProgramState;
  menu: MenuState;
}

export const rootReducer = createReducer<RootState>(
  {
    editor: { mode: "idle" },
    program: generateInitialProgramState(),
    menu: { open: false },
  },
  (builder) => builder
);
