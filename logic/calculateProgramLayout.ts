import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import programToDependencyGraph from "./programToDependencyGraph";
import reverseGraph from "./graph/reverseGraph";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries from "./geometry/layoutIntervalsInSeries";

export default function calculateDefaultLayout(program: Program): {
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
    rootNodeIds.map((id) => blockSizes[id].height),
    40
  );
  for (let i = 0; i < rootNodeIds.length; i++) {
    const rootNodeId = rootNodeIds[i];
    const clusterInterval = clusterIntervals[i];
    blockCenters[rootNodeId] = { x: 0, y: clusterInterval.center };
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
