import { BlockId } from "./Program";

export default interface Connection {
  sourceBlockId: BlockId;
  sourceBlockOutputIndex: number;
  destinationBlockId: BlockId;
  destinationBlockInputIndex: number;
}
