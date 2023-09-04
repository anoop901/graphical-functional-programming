import BlockLayout from "@/model/BlockLayout";
import { Interval } from "./geometry/layoutIntervalsInSeries";
import { LAYER_MARGIN } from "./constants";
import InsertionLocation from "@/model/InsertionLocation";

/**
 * Determines where a block should be inserted into a program, if it is dropped at the given mouse position.
 *
 * If the mouse is not over a layer, the block should be inserted between
 * layers. In this case, the following object will be returned:
 *
 * ```
 * {
 *   type: "betweenLayers",
 *   layerIndex: <index>
 * }
 * ```
 *
 * Where:
 * - `<index>` is the index of the layer that the block should be inserted
 *   before (or, if it is to be inserted after the last layer, this is the
 *   number of layers)
 *
 * If the mouse is over a layer, the block should be inserted between clusters
 * within that layer. In this case, the following object will be returned:
 * ```
 * {
 *   type: "betweenClustersWithinLayer",
 *   layerIndex: <layerIndex>,
 *   index: <index>
 * }
 * ```
 *
 * Where:
 * - `<layerIndex>` is the index of the layer in which the block should be
 *   inserted
 * - `<index>` is the index of the cluster that the block should
 *   be inserted before (or, if it is to be inserted after the last cluster,
 *   this is the number of clusters in the layer)
 *
 * @param layerIntervals The intervals corresponding to the y-coordinates of the layers, as returned from calculateProgramLayout.
 * @param blockLayouts The layouts of the blocks in the program, as returned from calculateProgramLayout.
 * @param layers The cluster roots in each layer, as specified in the `layers` field of a Program.
 * @param mousePosition The current position of the mouse, in SVG coordinates.
 * @returns An object describing where the block should be inserted.
 */
export default function calculateInsertionLocation(
  layerIntervals: Interval[],
  blockLayouts: { [id: string]: BlockLayout },
  layers: string[][],
  mousePosition: { x: number; y: number }
): InsertionLocation {
  const layerIndex = layerIntervals.findIndex(
    ({ left, right }) =>
      left - LAYER_MARGIN <= mousePosition.y &&
      mousePosition.y <= right + LAYER_MARGIN
  );
  if (layerIndex < 0) {
    const layerIndex = layerIntervals.findIndex(
      ({ left }) => mousePosition.y < left - LAYER_MARGIN
    );
    return {
      type: "betweenLayers",
      layerIndex: layerIndex < 0 ? layers.length : layerIndex,
    };
  }
  const layer = layers[layerIndex];
  const blockIndex = layer.findIndex((blockId) => {
    return blockLayouts[blockId].center.x > mousePosition.x;
  });
  if (blockIndex < 0) {
    return {
      type: "betweenClustersWithinLayer",
      layerIndex: layerIndex,
      index: layer.length,
    };
  }
  return {
    type: "betweenClustersWithinLayer",
    layerIndex: layerIndex,
    index: blockIndex,
  };
}
