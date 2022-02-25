import { BlockId, ConnectionId } from "./types";

export type EditorState =
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
