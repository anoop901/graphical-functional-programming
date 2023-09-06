import { CLUSTER_MARGIN, LAYER_MARGIN } from "@/logic/constants";
import { Interval } from "@/logic/geometry/layoutIntervalsInSeries";
import BlockLayout from "@/model/BlockLayout";
import InsertionLocation from "@/model/InsertionLocation";
import { Program } from "@/model/Program";
import { motion } from "framer-motion";

const BETWEEN_LAYERS_INSERTION_LOCATION_LINE_LENGTH = 200;
const LINE_STYLE = {
  stroke: "#36c",
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  opacity: 0.3,
};

export interface InsertionLocationPreviewProps {
  /** The insertion location to display. */
  insertionLocation: InsertionLocation;
  /** The program being shown in this `ProgramEditor`. */
  program: Program;
  /** The blockLayouts returned by `calculateProgramLayout`. */
  blockLayouts: { [id: string]: BlockLayout };
  /** The `layerIntervals` returned by `calculateProgramLayout`. */
  layerIntervals: Interval[];
}

/**
 * Renders a line representing a cluster insertion location within a program.
 */
export default function InsertionLocationPreview({
  insertionLocation,
  program,
  blockLayouts,
  layerIntervals,
}: InsertionLocationPreviewProps) {
  if (insertionLocation.type === "betweenClustersWithinLayer") {
    const x =
      insertionLocation.index === 0
        ? blockLayouts[program.layers[insertionLocation.layerIndex][0]].topLeft
            .x - CLUSTER_MARGIN
        : insertionLocation.index ===
          program.layers[insertionLocation.layerIndex].length
        ? blockLayouts[
            program.layers[insertionLocation.layerIndex][
              program.layers[insertionLocation.layerIndex].length - 1
            ]
          ].bottomRight.x + CLUSTER_MARGIN
        : (blockLayouts[
            program.layers[insertionLocation.layerIndex][
              insertionLocation.index - 1
            ]
          ].bottomRight.x +
            blockLayouts[
              program.layers[insertionLocation.layerIndex][
                insertionLocation.index
              ]
            ].topLeft.x) /
          2;
    return (
      <motion.line
        x1={x}
        x2={x}
        y1={layerIntervals[insertionLocation.layerIndex].left - LAYER_MARGIN}
        y2={layerIntervals[insertionLocation.layerIndex].right + LAYER_MARGIN}
        {...LINE_STYLE}
      />
    );
  } else {
    let y = 0;
    if (layerIntervals.length === 0) {
      y = 0;
    } else {
      if (insertionLocation.layerIndex === 0) {
        y = layerIntervals[0].left - CLUSTER_MARGIN;
      } else if (insertionLocation.layerIndex < layerIntervals.length) {
        y =
          (layerIntervals[insertionLocation.layerIndex - 1].right +
            layerIntervals[insertionLocation.layerIndex].left) /
          2;
      } else {
        y = layerIntervals[layerIntervals.length - 1].right + CLUSTER_MARGIN;
      }
    }
    return (
      <motion.line
        x1={-BETWEEN_LAYERS_INSERTION_LOCATION_LINE_LENGTH / 2}
        x2={BETWEEN_LAYERS_INSERTION_LOCATION_LINE_LENGTH / 2}
        y1={y}
        y2={y}
        {...LINE_STYLE}
      />
    );
  }
}
