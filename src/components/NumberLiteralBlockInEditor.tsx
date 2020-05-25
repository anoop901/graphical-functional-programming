import * as React from "react";
import NumberLiteralBlock from "../block/NumberLiteralBlock";
import { notchHalfWidth, notchHeight, blockHeight } from "../constants";
import buildSvgPath from "../BuildSvgPath";

export default function NumberLiteralBlockInEditor({
  block,
  onMouseDown,
  location,
}: {
  block: NumberLiteralBlock;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const hue = 120;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const blockWidth = 50;

  return (
    <g
      onMouseDown={onMouseDown}
      transform={`translate(${location.x} ${location.y})`}
    >
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={buildSvgPath([
          { type: "move" as "move", to: { x: 0, y: 0 } },
          { type: "line" as "line", to: { x: blockWidth, y: 0 } },
          { type: "line" as "line", to: { x: blockWidth, y: blockHeight } },
          {
            type: "line" as "line",
            to: { x: blockWidth / 2 + notchHalfWidth, y: blockHeight },
          },
          {
            type: "line" as "line",
            to: { x: blockWidth / 2, y: blockHeight + notchHeight },
          },
          {
            type: "line" as "line",
            to: { x: blockWidth / 2 - notchHalfWidth, y: blockHeight },
          },
          { type: "line" as "line", to: { x: 0, y: blockHeight } },
        ])}
      ></path>
      <text
        className="BlockText"
        x={blockWidth / 2}
        y={blockHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {block.value}
      </text>
    </g>
  );
}
