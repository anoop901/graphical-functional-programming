import * as React from "react";
import buildSvgPath from "../BuildSvgPath";
import { update } from "immutable";
import { connectionBezierAnchorShrinkingDistanceThreshold } from "../constants";
import ClearIcon from "@material-ui/icons/Clear";

export default function ConnectionInEditor({
  removeConnection,
  sourceOutputLocation,
  destInputLocation,
  preview = false,
}: {
  removeConnection: () => void;
  sourceOutputLocation: { x: number; y: number };
  destInputLocation: { x: number; y: number };
  preview?: boolean;
}): JSX.Element {
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
    <g pointerEvents={preview ? "none" : "visiblePainted"}>
      <path
        d={svgPath}
        stroke={hovering || preview ? "#0004" : "#000"}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      ></path>
      {hovering && !preview ? (
        <foreignObject
          x={(sourceOutputLocation.x + destInputLocation.x) / 2 - 12}
          y={(sourceOutputLocation.y + destInputLocation.y) / 2 - 12}
          width={24}
          height={24}
        >
          <ClearIcon htmlColor="#f00" />
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
