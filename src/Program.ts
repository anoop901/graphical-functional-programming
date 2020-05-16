import type Block from "./block/Block";
import { Map } from "immutable";
import { v4 as uuid } from "uuid";
import Connection from "./Connection";

export type BlockId = string;
export type ConnectionId = string;

export default class Program {
  private constructor(
    public readonly blocks: Map<BlockId, Block> = Map(),
    public readonly connections: Map<ConnectionId, Connection> = Map()
  ) {}

  static create(): Program {
    return new Program();
  }

  addBlock(block: Block): { newProgram: Program; newBlockId: BlockId } {
    const newBlockId = uuid();
    return {
      newProgram: new Program(
        this.blocks.set(newBlockId, block),
        this.connections
      ),
      newBlockId,
    };
  }

  removeBlock(blockId: BlockId): Program {
    return new Program(this.blocks.remove(blockId), this.connections);
  }

  addConnection(connection: Connection): Program {
    const sourceBlock = this.blocks.get(connection.sourceBlockId);
    if (sourceBlock === undefined) {
      throw new Error(
        `source block id ${connection.sourceBlockId} not present in program`
      );
    }
    const destinationBlock = this.blocks.get(connection.destinationBlockId);
    if (destinationBlock === undefined) {
      throw new Error(
        `destination block id ${connection.destinationBlockId} not present in program`
      );
    }
    if (
      connection.sourceBlockOutputIndex < 0 ||
      connection.sourceBlockOutputIndex >= sourceBlock.numOutputs
    ) {
      throw new Error(
        `source block output index ${connection.sourceBlockOutputIndex} is out of range`
      );
    }
    if (
      connection.destinationBlockInputIndex < 0 ||
      connection.destinationBlockInputIndex >= destinationBlock.numInputs
    ) {
      throw new Error(
        `destination block input index ${connection.destinationBlockInputIndex} is out of range`
      );
    }
    // TODO: throw error on recursive connections
    const newConnectionId = uuid();
    return new Program(
      this.blocks,
      this.connections.set(newConnectionId, connection)
    );
  }
}
