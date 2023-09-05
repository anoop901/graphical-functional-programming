import InsertionLocation from "@/model/InsertionLocation";
import { Program } from "@/model/Program";

/**
 * Moves a block to a new location in the program, such that it is a cluster
 * root. If the block was already a cluster root, it is removed from its
 * original location in one of the program's layers arrays in addition to being
 * inserted at the new location. If the block was nested in another block,
 * it stops being nested and becomes a new cluster root.
 *
 * @param blockId The ID of the cluster to move.
 * @param program The program. This object may be mutated.
 * @param insertionLocation The location to insert the cluster.
 */
export default function moveBlockToNewLocationAsClusterRoot(
  program: Program, // mutable
  blockId: string,
  insertionLocation: InsertionLocation
): void {
  const removeClusterResult = removeClusterFromLayers(program.layers, blockId);
  const insertionLocationMutable = { ...insertionLocation };
  adjustInsertionLocationAfterRemove(
    insertionLocationMutable,
    removeClusterResult
  );
  program.blocks[blockId].nested = false; // turn block into a cluster root
  insertClusterInLayers(program.layers, blockId, insertionLocationMutable);
  removeEmptyLayers(program);
}

type RemoveClusterFromLayersResult = {
  layerIndex: number;
  index: number;
} | null;

/**
 * Removes a cluster from the program's layers.
 *
 * @param layers The layers of the program. Each layer is a list of cluster root
 *   block ids.
 * @param blockId The ID of the cluster to remove.
 * @returns  An object containing the following properties:
 * - `layerIndex`: The index of the layer that the cluster was removed from.
 * - `index`: The index of the cluster within the layer.
 *
 * If the cluster was not found in any layer, returns `null`.
 */
function removeClusterFromLayers(
  layers: string[][],
  blockId: string
): RemoveClusterFromLayersResult {
  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layer = layers[layerIndex];
    const index = layer.indexOf(blockId);
    if (index >= 0) {
      layer.splice(index, 1);
      return { layerIndex, index };
    }
  }
  return null;
}

function insertClusterInLayers(
  layers: string[][], // mutable
  blockId: string,
  insertionLocation: InsertionLocation
) {
  if (insertionLocation.type === "betweenLayers") {
    layers.splice(insertionLocation.layerIndex, 0, [blockId]);
  } else {
    layers[insertionLocation.layerIndex].splice(
      insertionLocation.index,
      0,
      blockId
    );
  }
}

/**
 * Adjust the insertion location in response to a block being removed from the
 * program. This would change the insertion location if the block was removed
 * from a location in the same layer before where it will be inserted.
 *
 * @param insertionLocation The insertion location to adjust. This object may be
 *   mutated.
 * @param removeClusterResult The result of calling `removeClusterFromLayers`.
 */
function adjustInsertionLocationAfterRemove(
  insertionLocation: InsertionLocation, // mutable
  removeClusterResult: RemoveClusterFromLayersResult
): void {
  if (
    removeClusterResult != null &&
    insertionLocation.type === "betweenClustersWithinLayer" &&
    insertionLocation.layerIndex === removeClusterResult.layerIndex &&
    insertionLocation.index > removeClusterResult.index
  ) {
    insertionLocation.index--;
  }
}

function removeEmptyLayers(
  program: Program // mutable
) {
  program.layers = program.layers.filter((layer) => layer.length > 0);
}
