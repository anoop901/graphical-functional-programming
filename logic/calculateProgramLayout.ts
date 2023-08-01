import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getDependenciesOfBlock, getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries from "./geometry/layoutIntervalsInSeries";
import programToNestedDependencyGraph from "./programToNestedDependencyGraph";
import findRoots from "./graph/findRoots";

export default function calculateDefaultLayout(program: Program): {
  blockLayouts: {
    [id: string]: BlockLayout;
  };
  lineConnectionEndpoints: {
    dependencyBlockId: string;
    endpoint: { x: number; y: number };
  }[];
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

  // const { intervals: clusterIntervals } = layoutIntervalsInSeries(
  //   clusterRootBlockIds.map((id) => blockSizes[id].height),
  //   40
  // );
  for (let i = 0; i < clusterRootBlockIds.length; i++) {
    const clusterRootBlockId = clusterRootBlockIds[i];
    // const clusterInterval = clusterIntervals[i];
    blockCenters[clusterRootBlockId] = {
      x: 0,
      // y: clusterInterval.center,
      y: 0,
    };
  }

  const layerHeights = [];
  for (const layer of program.layers) {
    const { intervals: clusterIntervals } = layoutIntervalsInSeries(
      layer.map((id) => blockSizes[id].width),
      40
    );
    for (let i = 0; i < layer.length; i++) {
      const clusterRootBlockId = layer[i];
      const clusterInterval = clusterIntervals[i];
      blockCenters[clusterRootBlockId] = {
        x: clusterInterval.center,
        y: 0,
      };
    }
    layerHeights.push(Math.max(...layer.map((id) => blockSizes[id].height)));
  }

  const { intervals: layerIntervals } = layoutIntervalsInSeries(
    layerHeights,
    80
  );

  for (let layerIndex = 0; layerIndex < program.layers.length; layerIndex++) {
    const layer = program.layers[layerIndex];
    for (let i = 0; i < layer.length; i++) {
      const clusterRootBlockId = layer[i];
      blockCenters[clusterRootBlockId].y = layerIntervals[layerIndex].center;
    }
  }

  const lineConnectionEndpoints: {
    dependencyBlockId: string;
    endpoint: { x: number; y: number };
  }[] = [];

  for (const blockId of blocksReverseTopologicallySorted) {
    const dependencyBlockIds = getDependenciesOfBlock(program.blocks[blockId]);
    for (let i = 0; i < dependencyBlockIds.length; i++) {
      const dependencyBlockId = dependencyBlockIds[i];
      const dependencyLocationWithinBlock = {
        x: blockCenters[blockId].x + blockDependenciesOffsets[blockId][i].x,
        y: blockCenters[blockId].y + blockDependenciesOffsets[blockId][i].y,
      };
      if (program.blocks[dependencyBlockId].nested) {
        blockCenters[dependencyBlockId] = dependencyLocationWithinBlock;
      } else {
        lineConnectionEndpoints.push({
          dependencyBlockId,
          endpoint: dependencyLocationWithinBlock,
        });
      }
    }
  }

  const blockLayouts: { [id: string]: BlockLayout } = {};
  for (const blockId of allBlockIds) {
    blockLayouts[blockId] = {
      center: blockCenters[blockId],
      output: {
        x: blockCenters[blockId].x,
        y: blockCenters[blockId].y + blockSizes[blockId].height / 2,
      },
      size: blockSizes[blockId],
    };
  }

  return { blockLayouts, lineConnectionEndpoints };
}
