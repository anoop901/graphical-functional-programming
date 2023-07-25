import Block, { getDependenciesOfBlock, getLayoutCalculator } from "./Block";
import BlockLayout from "./BlockLayout";

export interface Program {
  blocks: { [id: string]: Block };
}

export function makeInitialProgram(): Program {
  const blockId1 = window.crypto.randomUUID();
  const blockId2 = window.crypto.randomUUID();
  const blockId3 = window.crypto.randomUUID();
  const blockId4 = window.crypto.randomUUID();
  const blockId5 = window.crypto.randomUUID();
  const blockId6 = window.crypto.randomUUID();
  const blockId7 = window.crypto.randomUUID();
  const blockId8 = window.crypto.randomUUID();
  const blockId9 = window.crypto.randomUUID();
  const blockId10 = window.crypto.randomUUID();
  return {
    blocks: {
      [blockId1]: { type: "IntegerLiteralBlock", value: 10 },
      [blockId2]: { type: "IntegerLiteralBlock", value: 20 },
      [blockId3]: { type: "IntegerLiteralBlock", value: 30 },
      [blockId4]: {
        type: "ReferenceBlock",
        name: "plus",
      },
      [blockId5]: {
        type: "ArrayBlock",
        elementBlockIds: [blockId1, blockId2],
      },
      [blockId6]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId4,
        argumentBlockId: blockId5,
      },
      [blockId7]: { type: "IntegerLiteralBlock", value: 40 },
      [blockId8]: {
        type: "ReferenceBlock",
        name: "times",
      },
      [blockId9]: {
        type: "ArrayBlock",
        elementBlockIds: [blockId6, blockId7],
      },
      [blockId10]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId8,
        argumentBlockId: blockId9,
      },
    },
  };
}

export function calculateLayout(program: Program): {
  [id: string]: BlockLayout;
} {
  const layout: { [id: string]: BlockLayout } = {};

  // Caution: This loop can be infinite if there is a circular dependency in the
  // program. The blocks in the path of the circular dependency will never be
  // identified as the next block to be laid out because they will always have
  // dependencies that have not been laid out yet for the same reason. TODO:
  // check for cycles and if any are found, throw an error before this loop.
  while (!Object.keys(program.blocks).every((id) => id in layout)) {
    for (const [blockId, block] of Object.entries(program.blocks)) {
      const dependencyBlockIds = getDependenciesOfBlock(block);
      if (
        !(blockId in layout) &&
        dependencyBlockIds.every((id) => id in layout)
      ) {
        layout[blockId] = getLayoutCalculator(block)(
          dependencyBlockIds.map((id) => layout[id])
        );
      }
    }
  }

  return layout;
}
