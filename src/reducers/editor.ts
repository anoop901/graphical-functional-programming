import { createReducer } from "@reduxjs/toolkit";
import { BlockId, ConnectionId } from "./types";

type EditorState =
  | {
      mode: "idle";
      hoveredBlockOutput?: { blockId: BlockId; outputIndex: number };
      hoveredConnection?: ConnectionId;
    }
  | {
      mode: "drag";
      blockId: BlockId;
      offsetFromMouse: Location;
    }
  | {
      mode: "drawNewConnection";
      sourceBlockId: BlockId;
      sourceBlockOutputIndex: number;
      mouseLocation: Location;
      hoveredBlockInput?: { blockId: BlockId; inputIndex: number };
    };

export const editorReducer = createReducer<EditorState>(
  { mode: "idle" },
  (builder) => builder
);
