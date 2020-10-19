import type Block from "./block/Block";
import { Map } from "immutable";
import { v4 as uuid } from "uuid";
import Connection from "./Connection";
import NumberOutputBlock from "./block/NumberOutputBlock";
import NumberInputBlock from "./block/NumberInputBlock";

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

  getBlock(blockId: BlockId): Block {
    const block = this.blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`no block with id ${blockId}`);
    }
    return block;
  }

  setBlock(blockId: BlockId, block: Block): Program {
    return new Program(this.blocks.set(blockId, block), this.connections);
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

  removeConnection(connectionId: ConnectionId): Program {
    return new Program(this.blocks, this.connections.remove(connectionId));
  }

  blockInputIsUnconnected(blockId: BlockId, inputIndex: number): boolean {
    return this.connections
      .filter(
        (connection) =>
          connection.destinationBlockId === blockId &&
          connection.destinationBlockInputIndex === inputIndex
      )
      .isEmpty();
  }

  getConnectionToBlockInput(
    blockId: BlockId,
    inputIndex: number
  ): Connection | null {
    const [matchingConnectionEntry] = this.connections.filter(
      (connection) =>
        connection.destinationBlockId === blockId &&
        connection.destinationBlockInputIndex === inputIndex
    );
    if (matchingConnectionEntry !== undefined) {
      const [, matchingConnection] = matchingConnectionEntry;
      return matchingConnection;
    } else {
      return null;
    }
  }

  getOutputBlocks(): Map<BlockId, Block> {
    return this.blocks.filter(
      (block) =>
        // TODO: change this when other types of blocks are added
        block instanceof NumberOutputBlock
    );
  }

  evaluate(inputValues: Map<BlockId, number>): Map<BlockId, number | null> {
    const evaluateBlockInput: (
      blockId: BlockId,
      inputIndex: number
    ) => number | null = (
      blockId: BlockId,
      inputIndex: number
    ): number | null => {
      const connection = this.getConnectionToBlockInput(blockId, inputIndex);
      if (connection !== null) {
        const { sourceBlockId, sourceBlockOutputIndex } = connection;
        return evaluateBlockOutput(sourceBlockId, sourceBlockOutputIndex);
      } else {
        return null;
      }
    };

    const evaluateBlockOutput: (
      blockId: BlockId,
      outputIndex: number
    ) => number | null = (
      blockId: BlockId,
      outputIndex: number
    ): number | null => {
      const block = this.getBlock(blockId);

      if (block instanceof NumberInputBlock) {
        return inputValues.get(blockId, 0);
      }

      const blockInputValuesOrNulls = Array.from(
        { length: block.numInputs },
        (_, inputIndex) => evaluateBlockInput(blockId, inputIndex)
      );
      const blockInputValues = blockInputValuesOrNulls.filter(
        (value) => value !== null
      ) as number[];
      if (blockInputValues.length === blockInputValuesOrNulls.length) {
        return block.evaluate(blockInputValues)[outputIndex];
      } else {
        return null;
      }
    };

    const outputBlocks = this.getOutputBlocks();
    return outputBlocks.map((block, blockId) => {
      return evaluateBlockInput(blockId, 0);
    });
  }
}
