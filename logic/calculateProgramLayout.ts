import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getDependenciesOfBlock, getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries from "./geometry/layoutIntervalsInSeries";
import programToNestedDependencyGraph from "./programToNestedDependencyGraph";
import findRoots from "./graph/findRoots";

function topologicallySortClusters(
  clusterRootBlockIds: string[],
  nestedDependencyGraph: { [id: string]: string[] }
): string[][] {
  const clusters: string[][] = [];
  for (const clusterRootBlockId of clusterRootBlockIds) {
    const clusterBlocks = getDescendantsTopologicallySorted(
      nestedDependencyGraph,
      clusterRootBlockId
    );
    clusters.push(clusterBlocks);
  }
  return clusters;
}

function calculateBlockSizesAndOffsets(
  program: Program,
  clustersTopologicallySorted: string[][]
) {
  const blockSizes: { [id: string]: { width: number; height: number } } = {};
  const blockDependenciesOffsets: { [id: string]: { x: number; y: number }[] } =
    {};
  for (const cluster of clustersTopologicallySorted) {
    for (const blockIdInCluster of cluster) {
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
  }
  return { blockSizes, blockDependenciesOffsets };
}

function calculateClusterRootBlockCenters(
  clusterRootBlockIds: string[],
  program: Program,
  blockSizes: { [id: string]: { width: number; height: number } }
): { [id: string]: { x: number; y: number } } {
  const clusterRootBlockCenters: { [id: string]: { x: number; y: number } } =
    {};

  for (const clusterRootBlockId of clusterRootBlockIds) {
    clusterRootBlockCenters[clusterRootBlockId] = {
      x: 0,
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
      clusterRootBlockCenters[clusterRootBlockId].x = clusterInterval.center;
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
      clusterRootBlockCenters[clusterRootBlockId].y =
        layerIntervals[layerIndex].center;
    }
  }

  return clusterRootBlockCenters;
}

function calculateNestedBlockCentersAndLineConnectionEndpoints(
  clustersTopologicallySorted: string[][],
  program: Program,
  blockDependenciesOffsets: { [id: string]: { x: number; y: number }[] },
  blockCenters: { [id: string]: { x: number; y: number } }
): {
  blockCenters: { [id: string]: { x: number; y: number } };
  lineConnectionEndpoints: {
    dependencyBlockId: string;
    endpoint: {
      x: number;
      y: number;
    };
  }[];
} {
  const lineConnectionEndpoints: {
    dependencyBlockId: string;
    endpoint: { x: number; y: number };
  }[] = [];

  for (const cluster of clustersTopologicallySorted) {
    for (const blockId of [...cluster].reverse()) {
      const dependencyBlockIds = getDependenciesOfBlock(
        program.blocks[blockId]
      );
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
  }

  return { blockCenters, lineConnectionEndpoints };
}

export default function calculateProgramLayout(program: Program): {
  blockLayouts: {
    [id: string]: BlockLayout;
  };
  lineConnectionEndpoints: {
    dependencyBlockId: string;
    endpoint: { x: number; y: number };
  }[];
} {
  const nestedDependencyGraph = programToNestedDependencyGraph(program);
  const clusterRootBlockIds = findRoots(nestedDependencyGraph);
  const clustersTopologicallySorted = topologicallySortClusters(
    clusterRootBlockIds,
    nestedDependencyGraph
  );
  const { blockSizes, blockDependenciesOffsets } =
    calculateBlockSizesAndOffsets(program, clustersTopologicallySorted);
  const clusterRootBlockCenters = calculateClusterRootBlockCenters(
    clusterRootBlockIds,
    program,
    blockSizes
  );
  const { blockCenters, lineConnectionEndpoints } =
    calculateNestedBlockCentersAndLineConnectionEndpoints(
      clustersTopologicallySorted,
      program,
      blockDependenciesOffsets,
      clusterRootBlockCenters // will be mutated; don't use after this call
    );

  const blockLayouts: { [id: string]: BlockLayout } = {};
  for (const blockId of Object.keys(program.blocks)) {
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
