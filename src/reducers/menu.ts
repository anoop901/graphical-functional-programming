import { createReducer } from "@reduxjs/toolkit";
import { BlockId } from "./types";

type MenuState =
  | {
      open: false;
    }
  | {
      open: true;
      targetBlock?: BlockId;
      location: { x: number; y: number };
    };

export const menuReducer = createReducer<MenuState>(
  { open: false },
  (builder) => builder
);
