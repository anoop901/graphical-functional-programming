import ProgramLayout from "../ProgramLayout";
import * as React from "react";
import Connection from "../Connection";
import { getBlockInputLocation, getBlockOutputLocation } from "./BlockInEditor";
import buildSvgPath from "../BuildSvgPath";
import { update } from "immutable";
import { connectionBezierAnchorShrinkingDistanceThreshold } from "../constants";

export default function ConnectionInEditor({
  programLayout,
  connection,
}: {
  programLayout: ProgramLayout;
  connection: Connection;
}): JSX.Element {
  const sourceOutputLocation = getBlockOutputLocation(
    connection.sourceBlockId,
    connection.sourceBlockOutputIndex,
    programLayout
  );
  const destInputLocation = getBlockInputLocation(
    connection.destinationBlockId,
    connection.destinationBlockInputIndex,
    programLayout
  );

  const sq = (x: number) => x * x;
  const distance = Math.sqrt(
    sq(destInputLocation.x - sourceOutputLocation.x) +
      sq(destInputLocation.y - sourceOutputLocation.y)
  );
  return (
    <path
      d={buildSvgPath([
        { type: "move", to: sourceOutputLocation },
        {
          type: "curve",
          anchor1: update(
            sourceOutputLocation,
            "y",
            (y) =>
              y +
              Math.min(
                connectionBezierAnchorShrinkingDistanceThreshold,
                distance / 3
              )
          ),
          anchor2: update(
            destInputLocation,
            "y",
            (y) =>
              y -
              Math.min(
                connectionBezierAnchorShrinkingDistanceThreshold,
                distance / 3
              )
          ),
          to: destInputLocation,
        },
      ])}
      stroke="black"
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
    ></path>
  );
}
