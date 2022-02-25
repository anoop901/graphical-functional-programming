import { BlockId } from "./types";

export type MenuState =
  | {
      open: false;
    }
  | {
      open: true;
      targetBlock?: BlockId;
      location: { x: number; y: number };
    };
