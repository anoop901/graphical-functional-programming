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
        elementBlockIds: [blockId1, blockId2, blockId3],
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
  const blockDependents: { [id: string]: string } = {};
  const blockIdsTopologicallySorted = [];
  const visitedBlockIds = new Set<string>();

  while (
    blockIdsTopologicallySorted.length < Object.keys(program.blocks).length
  ) {
    let found = false;
    for (const [blockId, block] of Object.entries(program.blocks)) {
      const dependencies = getDependenciesOfBlock(block);
      if (
        !visitedBlockIds.has(blockId) &&
        dependencies.every((id) => visitedBlockIds.has(id))
      ) {
        blockIdsTopologicallySorted.push(blockId);
        visitedBlockIds.add(blockId);
        for (const dependencyBlockId of dependencies) {
          blockDependents[dependencyBlockId] = blockId;
        }
        found = true;
      }
    }
    if (!found) {
      throw new Error("Circular dependency detected");
    }
  }

  const blockSizes: { [id: string]: { width: number; height: number } } = {};
  const blockOffsets: { [id: string]: { x: number; y: number } } = {};

  for (const blockId of blockIdsTopologicallySorted) {
    const block = program.blocks[blockId];
    const dependencyBlockIds = getDependenciesOfBlock(block);
    if (
      !(blockId in blockSizes) &&
      dependencyBlockIds.every((id) => id in blockSizes)
    ) {
      const { size, dependenciesOffsets } = getLayoutCalculator(block)(
        dependencyBlockIds.map((id) => blockSizes[id])
      );
      blockSizes[blockId] = size;
      for (let i = 0; i < dependencyBlockIds.length; i++) {
        blockOffsets[dependencyBlockIds[i]] = dependenciesOffsets[i];
      }
    }
  }

  blockIdsTopologicallySorted.reverse();

  const blockCenters: { [id: string]: { x: number; y: number } } = {};

  for (const blockId of blockIdsTopologicallySorted) {
    const dependentId = blockDependents[blockId];
    if (dependentId != null) {
      const dependentCenter = blockCenters[dependentId];
      const offset = blockOffsets[blockId];
      blockCenters[blockId] = {
        x: dependentCenter.x + offset.x,
        y: dependentCenter.y + offset.y,
      };
    } else {
      blockCenters[blockId] = { x: 0, y: 0 };
    }
  }

  const layout: { [id: string]: BlockLayout } = {};
  for (const blockId of Object.keys(program.blocks)) {
    layout[blockId] = {
      center: blockCenters[blockId],
      size: blockSizes[blockId],
    };
  }

  return layout;
}
