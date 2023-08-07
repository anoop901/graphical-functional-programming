import BlockLayout from "@/model/BlockLayout";
import { Program } from "@/model/Program";
import getDescendantsTopologicallySorted from "./graph/getDescendantsTopologicallySorted";
import { getDependenciesOfBlock, getLayoutCalculator } from "@/model/Block";
import layoutIntervalsInSeries, {
  Interval,
} from "./geometry/layoutIntervalsInSeries";
import programToNestedDependencyGraph from "./programToNestedDependencyGraph";
import findRoots from "./graph/findRoots";

const LINE_CONNECTION_ENDPOINT_SIZE = 10;

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
            : {
                width: LINE_CONNECTION_ENDPOINT_SIZE,
                height: LINE_CONNECTION_ENDPOINT_SIZE,
              }
        )
      );
      blockSizes[blockIdInCluster] = size;
      blockDependenciesOffsets[blockIdInCluster] = dependenciesOffsets;
    }
  }
  return { blockSizes, blockDependenciesOffsets };
}

function calculateClusterRootBlockTopLeftsAndLayerIntervals(
  program: Program,
  clusters: { [id: string]: string[] },
  blockSizes: { [id: string]: { width: number; height: number } }
): {
  clusterRootBlockTopLefts: { [id: string]: { x: number; y: number } };
  layerIntervals: Interval[];
} {
  const clusterRootBlockTopLefts: { [id: string]: { x: number; y: number } } =
    {};

  for (const clusterRootBlockId of Object.keys(clusters)) {
    clusterRootBlockTopLefts[clusterRootBlockId] = {
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
      clusterRootBlockTopLefts[clusterRootBlockId].x = clusterInterval.left;
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
      clusterRootBlockTopLefts[clusterRootBlockId].y =
        layerIntervals[layerIndex].right -
        blockSizes[clusterRootBlockId].height;
    }
  }

  return { clusterRootBlockTopLefts, layerIntervals };
}

interface LineConnectionLayout {
  dependencyBlockId: string;
  dependentBlockId: string;
  endpoint: {
    x: number;
    y: number;
  };
}

function calculateNestedBlockTopLeftsAndLineConnectionLayouts(
  program: Program,
  clusters: { [id: string]: string[] },
  blockDependenciesOffsets: { [id: string]: { x: number; y: number }[] },
  blockTopLefts: { [id: string]: { x: number; y: number } }
): {
  blockTopLefts: { [id: string]: { x: number; y: number } };
  lineConnectionLayouts: LineConnectionLayout[];
} {
  const lineConnectionLayouts: LineConnectionLayout[] = [];

  for (const cluster of Object.values(clusters)) {
    for (const blockId of [...cluster].reverse()) {
      const dependencyBlockIds = getDependenciesOfBlock(
        program.blocks[blockId]
      );
      for (let i = 0; i < dependencyBlockIds.length; i++) {
        const dependencyBlockId = dependencyBlockIds[i];
        const dependencyLocationWithinBlock = {
          x: blockTopLefts[blockId].x + blockDependenciesOffsets[blockId][i].x,
          y: blockTopLefts[blockId].y + blockDependenciesOffsets[blockId][i].y,
        };
        if (program.blocks[dependencyBlockId].nested) {
          blockTopLefts[dependencyBlockId] = dependencyLocationWithinBlock;
        } else {
          lineConnectionLayouts.push({
            dependencyBlockId,
            dependentBlockId: blockId,
            endpoint: {
              x:
                dependencyLocationWithinBlock.x +
                LINE_CONNECTION_ENDPOINT_SIZE / 2,
              y:
                dependencyLocationWithinBlock.y +
                LINE_CONNECTION_ENDPOINT_SIZE / 2,
            },
          });
        }
      }
    }
  }

  return { blockTopLefts, lineConnectionLayouts };
}

export default function calculateProgramLayout(program: Program): {
  blockLayouts: {
    [id: string]: BlockLayout;
  };
  lineConnectionLayouts: LineConnectionLayout[];
  layerIntervals: Interval[];
} {
  const clusters = getClusters(program);
  const { blockSizes, blockDependenciesOffsets } =
    calculateBlockSizesAndOffsets(program, clusters);
  const { clusterRootBlockTopLefts, layerIntervals } =
    calculateClusterRootBlockTopLeftsAndLayerIntervals(
      program,
      clusters,
      blockSizes
    );
  const { blockTopLefts, lineConnectionLayouts } =
    calculateNestedBlockTopLeftsAndLineConnectionLayouts(
      program,
      clusters,
      blockDependenciesOffsets,
      clusterRootBlockTopLefts // will be mutated; don't use after this call
    );

  const blockLayouts: { [id: string]: BlockLayout } = {};
  for (const blockId of Object.keys(program.blocks)) {
    blockLayouts[blockId] = {
      topLeft: blockTopLefts[blockId],
      center: {
        x: blockTopLefts[blockId].x + blockSizes[blockId].width / 2,
        y: blockTopLefts[blockId].y + blockSizes[blockId].height / 2,
      },
      output: {
        x: blockTopLefts[blockId].x + blockSizes[blockId].width / 2,
        y: blockTopLefts[blockId].y + blockSizes[blockId].height,
      },
      size: blockSizes[blockId],
    };
  }

  return { blockLayouts, lineConnectionLayouts, layerIntervals };
}
