import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getDependenciesOfBlock, getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries from "./geometry/layoutIntervalsInSeries";
import programToNestedDependencyGraph from "./programToNestedDependencyGraph";
import findRoots from "./graph/findRoots";

export default function calculateDefaultLayout(program: Program): {
  [id: string]: BlockLayout;
} {
  const allBlockIds = Object.keys(program.blocks);
  const nestedDependencyGraph = programToNestedDependencyGraph(program);
  const clusterRootBlockIds = findRoots(nestedDependencyGraph);

  const blockSizes: { [id: string]: { width: number; height: number } } = {};
  const blockDependenciesOffsets: { [id: string]: { x: number; y: number }[] } =
    {};
  const blocksReverseTopologicallySorted = [];

  for (const clusterRootBlockId of clusterRootBlockIds) {
    const blockIdsInCluster = getDescendantsTopologicallySorted(
      nestedDependencyGraph,
      clusterRootBlockId
    );

    for (const blockIdInCluster of blockIdsInCluster) {
      const block = program.blocks[blockIdInCluster];
      const dependencyBlockIds = getDependenciesOfBlock(block);
      const { size, dependenciesOffsets } = getLayoutCalculator(block)(
        dependencyBlockIds.map((dependencyId) =>
          program.blocks[dependencyId].nested
            ? blockSizes[dependencyId]
            : { width: 10, height: 10 }
        )
      );
      blockSizes[blockIdInCluster] = size;
      blockDependenciesOffsets[blockIdInCluster] = dependenciesOffsets;
    }

    blocksReverseTopologicallySorted.push(...blockIdsInCluster.reverse());
  }

  const blockCenters: { [id: string]: { x: number; y: number } } = {};

  const { intervals: clusterIntervals } = layoutIntervalsInSeries(
    clusterRootBlockIds.map((id) => blockSizes[id].height),
    40
  );
  for (let i = 0; i < clusterRootBlockIds.length; i++) {
    const clusterRootBlockId = clusterRootBlockIds[i];
    const clusterInterval = clusterIntervals[i];
    blockCenters[clusterRootBlockId] = { x: 0, y: clusterInterval.center };
  }

  for (const blockId of blocksReverseTopologicallySorted) {
    const dependencyBlockIds = getDependenciesOfBlock(program.blocks[blockId]);
    for (let i = 0; i < dependencyBlockIds.length; i++) {
      const dependencyBlockId = dependencyBlockIds[i];
      if (program.blocks[dependencyBlockId].nested) {
        blockCenters[dependencyBlockId] = {
          x: blockCenters[blockId].x + blockDependenciesOffsets[blockId][i].x,
          y: blockCenters[blockId].y + blockDependenciesOffsets[blockId][i].y,
        };
      } else {
        // TODO: Calculate the location of the end point of the line connection.
      }
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
