import getDescendantsTopologicallySorted from "@/logic/graph/getDescendantsTopologicallySorted";
import Block, { getDependenciesOfBlock, getLayoutCalculator } from "./Block";
import BlockLayout from "./BlockLayout";
import reverseGraph from "@/logic/graph/reverseGraph";
import layoutIntervalsInSeries from "@/logic/geometry/layoutIntervalsInSeries";

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
  const blockId11 = window.crypto.randomUUID();
  const blockId12 = window.crypto.randomUUID();
  const blockId13 = window.crypto.randomUUID();
  const blockId14 = window.crypto.randomUUID();
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
      [blockId14]: {
        type: "ReferenceBlock",
        name: "foo",
      },
      [blockId12]: {
        type: "FunctionCallBlock",
        functionBlockId: blockId13,
        argumentBlockId: blockId11,
      },
      [blockId13]: {
        type: "ReferenceBlock",
        name: "negative",
      },
      [blockId11]: {
        type: "IntegerLiteralBlock",
        value: 50,
      },
    },
  };
}

export function programToDependencyGraph(program: Program): {
  [nodeId: string]: string[];
} {
  const graph: { [nodeId: string]: string[] } = {};
  for (const blockId of Object.keys(program.blocks)) {
    graph[blockId] = getDependenciesOfBlock(program.blocks[blockId]);
  }
  return graph;
}

export function calculateLayout(program: Program): {
  [id: string]: BlockLayout;
} {
  const allBlockIds = Object.keys(program.blocks);
  const dependencyGraph = programToDependencyGraph(program);
  const dependentGraph = reverseGraph(dependencyGraph);
  const rootNodeIds = allBlockIds.filter(
    (nodeId) => dependentGraph[nodeId].length === 0
  );

  const blockSizes: { [id: string]: { width: number; height: number } } = {};
  // blockOffsets contains the offset of the center of each block relative to
  // the center of the block that depends on it.
  const blockOffsets: { [id: string]: { x: number; y: number } } = {};
  const blocksReverseTopologicallySorted = [];

  for (const rootNodeId of rootNodeIds) {
    const descendantIds = getDescendantsTopologicallySorted(
      dependencyGraph,
      rootNodeId
    );

    for (const descendantId of descendantIds) {
      const block = program.blocks[descendantId];
      const dependencyBlockIds = dependencyGraph[descendantId] ?? [];
      if (
        !(descendantId in blockSizes) &&
        dependencyBlockIds.every((id) => id in blockSizes)
      ) {
        const { size, dependenciesOffsets } = getLayoutCalculator(block)(
          dependencyBlockIds.map((id) => blockSizes[id])
        );
        blockSizes[descendantId] = size;
        for (let i = 0; i < dependencyBlockIds.length; i++) {
          blockOffsets[dependencyBlockIds[i]] = dependenciesOffsets[i];
        }
      }
    }

    blocksReverseTopologicallySorted.push(...descendantIds.reverse());
  }

  const blockCenters: { [id: string]: { x: number; y: number } } = {};

  const { intervals: clusterIntervals } = layoutIntervalsInSeries(
    rootNodeIds.map((id) => blockSizes[id].width),
    40
  );
  for (let i = 0; i < rootNodeIds.length; i++) {
    const rootNodeId = rootNodeIds[i];
    const clusterInterval = clusterIntervals[i];
    blockCenters[rootNodeId] = { x: clusterInterval.center, y: 0 };
  }

  for (const blockId of blocksReverseTopologicallySorted) {
    const dependentIds = dependentGraph[blockId];
    if (dependentIds.length > 0) {
      const dependentId = dependentIds[0];
      const dependentCenter = blockCenters[dependentId];
      const offset = blockOffsets[blockId];
      blockCenters[blockId] = {
        x: dependentCenter.x + offset.x,
        y: dependentCenter.y + offset.y,
      };
    }
  }

  const layout: { [id: string]: BlockLayout } = {};
  for (const blockId of allBlockIds) {
    layout[blockId] = {
      center: blockCenters[blockId],
      size: blockSizes[blockId],
    };
  }

  return layout;
}
