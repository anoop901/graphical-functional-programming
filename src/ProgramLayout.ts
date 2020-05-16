import type Block from "./block/Block";
import Program from "./Program";
import type { BlockId } from "./Program";
import { Map } from "immutable";

export default class ProgramLayout {
  private constructor(
    public readonly program: Program = Program.create(),
    public readonly blockLocations: Map<
      BlockId,
      { x: number; y: number }
    > = Map()
  ) {}

  static create(): ProgramLayout {
    return new ProgramLayout();
  }

  addBlock(
    block: Block,
    position: { x: number; y: number }
  ): { newBlockId: BlockId; newProgramLayout: ProgramLayout } {
    const { newProgram, newBlockId } = this.program.addBlock(block);
    return {
      newBlockId,
      newProgramLayout: new ProgramLayout(
        newProgram,
        this.blockLocations.set(newBlockId, position)
      ),
    };
  }

  removeBlock(blockId: BlockId): ProgramLayout {
    return new ProgramLayout(
      this.program.removeBlock(blockId),
      this.blockLocations.remove(blockId)
    );
  }
}
