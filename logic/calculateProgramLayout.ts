import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getDependenciesOfBlock, getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries from "./geometry/layoutIntervalsInSeries";
import programToNestedDependencyGraph from "./programToNestedDependencyGraph";
import findRoots from "./graph/findRoots";

function getClusters(program: Program): { [id: string]: string[] } {
  const nestedDependencyGraph = programToNestedDependencyGraph(program);
  const clusterRootBlockIds = findRoots(nestedDependencyGraph);
  const clusters: { [id: string]: string[] } = {};
  for (const clusterRootBlockId of clusterRootBlockIds) {
    const clusterBlocks = getDescendantsTopologicallySorted(
      nestedDependencyGraph,
      clusterRootBlockId
    );
    clusters[clusterRootBlockId] = clusterBlocks;
  }
  return clusters;
}

function calculateBlockSizesAndOffsets(
  program: Program,
  clusters: { [id: string]: string[] }
) {
  const blockSizes: { [id: string]: { width: number; height: number } } = {};
  const blockDependenciesOffsets: { [id: string]: { x: number; y: number }[] } =
    {};
  for (const cluster of Object.values(clusters)) {
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
  program: Program,
  clusters: { [id: string]: string[] },
  blockSizes: { [id: string]: { width: number; height: number } }
): { [id: string]: { x: number; y: number } } {
  const clusterRootBlockCenters: { [id: string]: { x: number; y: number } } =
    {};

  for (const clusterRootBlockId of Object.keys(clusters)) {
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
  program: Program,
  clusters: { [id: string]: string[] },
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

  for (const cluster of Object.values(clusters)) {
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
  const clusters = getClusters(program);
  const { blockSizes, blockDependenciesOffsets } =
    calculateBlockSizesAndOffsets(program, clusters);
  const clusterRootBlockCenters = calculateClusterRootBlockCenters(
    program,
    clusters,
    blockSizes
  );
  const { blockCenters, lineConnectionEndpoints } =
    calculateNestedBlockCentersAndLineConnectionEndpoints(
      program,
      clusters,
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
