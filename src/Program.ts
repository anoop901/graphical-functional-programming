import type Block from "./block/Block";
import { Map } from "immutable";
import { v4 as uuid } from "uuid";

export type BlockId = string;

export default class Program {
  private constructor(public readonly blocks: Map<BlockId, Block> = Map()) {}

  static create(): Program {
    return new Program();
  }

  addBlock(block: Block): { newProgram: Program; newBlockId: BlockId } {
    const newBlockId = uuid();
    return {
      newProgram: new Program(this.blocks.set(newBlockId, block)),
      newBlockId,
    };
  }

  removeBlock(blockId: BlockId): Program {
    return new Program(this.blocks.remove(blockId));
  }
}
