import { v4 as uuid } from "uuid";
import { Block, BlockId, Connection, ConnectionId } from "./types";

export interface ProgramState {
  blocks: { [blockId: BlockId]: Block };
  connections: { [connectionId: ConnectionId]: Connection };
}

export function generateInitialProgramState(): ProgramState {
  const blockIds = {
    literal3: uuid(),
    negative: uuid(),
    literal5: uuid(),
    plus: uuid(),
    times: uuid(),
    literal6: uuid(),
    result: uuid(),
  };
  return {
    blocks: {
      [blockIds.literal3]: {
        blockType: "numberLiteral",
        value: 3,
        location: { x: 200, y: 100 },
        editing: false,
      },
      [blockIds.literal5]: {
        blockType: "numberLiteral",
        value: 5,
        location: { x: 100, y: 100 },
        editing: false,
      },
      [blockIds.negative]: {
        blockType: "function",
        name: "negative",
        location: { x: 200, y: 200 },
      },
      [blockIds.plus]: {
        blockType: "function",
        name: "plus",
        location: { x: 100, y: 300 },
      },
      [blockIds.literal6]: {
        blockType: "numberLiteral",
        value: 6,
        location: { x: 300, y: 200 },
        editing: false,
      },
      [blockIds.times]: {
        blockType: "function",
        name: "times",
        location: { x: 200, y: 400 },
      },
      [blockIds.result]: {
        blockType: "numberDisplay",
        value: 0,
        location: { x: 250, y: 500 },
      },
      [uuid()]: {
        blockType: "definition",
        name: "foo",
        location: { x: 250, y: 600 },
        editing: false,
      },
      [uuid()]: {
        blockType: "reference",
        location: { x: 400, y: 600 },
        editing: false,
      },
    },
    connections: {
      [uuid()]: {
        sourceBlockId: blockIds.literal3,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.negative,
        destinationBlockInputIndex: 0,
      },
      [uuid()]: {
        sourceBlockId: blockIds.literal5,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.plus,
        destinationBlockInputIndex: 0,
      },
      [uuid()]: {
        sourceBlockId: blockIds.plus,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.times,
        destinationBlockInputIndex: 0,
      },
      [uuid()]: {
        sourceBlockId: blockIds.negative,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.plus,
        destinationBlockInputIndex: 1,
      },
      [uuid()]: {
        sourceBlockId: blockIds.literal6,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.times,
        destinationBlockInputIndex: 1,
      },
      [uuid()]: {
        sourceBlockId: blockIds.times,
        sourceBlockOutputIndex: 0,
        destinationBlockId: blockIds.result,
        destinationBlockInputIndex: 0,
      },
    },
  };
}
