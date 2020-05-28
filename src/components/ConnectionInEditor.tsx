import ProgramLayout from "../ProgramLayout";
import * as React from "react";
import Connection from "../Connection";
import { getBlockInputLocation, getBlockOutputLocation } from "./BlockInEditor";
import buildSvgPath from "../BuildSvgPath";
import { update } from "immutable";
import { connectionBezierAnchorShrinkingDistanceThreshold } from "../constants";
import LinkOffIcon from "@material-ui/icons/LinkOff";

export default function ConnectionInEditor({
  connection,
  programLayout,
  removeConnection,
}: {
  connection: Connection;
  programLayout: ProgramLayout;
  removeConnection: () => void;
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

  const [hovering, setHovering] = React.useState<boolean>(false);

  const sq = (x: number) => x * x;
  const distance = Math.sqrt(
    sq(destInputLocation.x - sourceOutputLocation.x) +
      sq(destInputLocation.y - sourceOutputLocation.y)
  );

  const svgPath = buildSvgPath([
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
  ]);
  return (
    <g>
      <path
        d={svgPath}
        stroke={hovering ? "#0004" : "#000"}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      ></path>
      {hovering ? (
        <foreignObject
          x={(sourceOutputLocation.x + destInputLocation.x) / 2 - 12}
          y={(sourceOutputLocation.y + destInputLocation.y) / 2 - 12}
          width={24}
          height={24}
        >
          <LinkOffIcon />
        </foreignObject>
      ) : null}
      <path
        onMouseEnter={() => {
          setHovering(true);
        }}
        onMouseLeave={() => {
          setHovering(false);
        }}
        onClick={() => {
          removeConnection();
        }}
        d={svgPath}
        stroke="#0000"
        strokeWidth={20}
        strokeLinecap="round"
        fill="none"
      ></path>
    </g>
  );
}
