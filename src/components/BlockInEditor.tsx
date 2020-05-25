import Block from "../block/Block";
import * as React from "react";

export default function BlockInEditor({
  block,
  onMouseDown,
}: {
  block: Block;
  onMouseDown?: (e: React.MouseEvent) => void;
}): JSX.Element {
  const hue = block.numInputs > 0 && block.numOutputs > 0 ? 200 : 120;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const minimumTerminalSpacing = 50;
  const notchHalfWidth = 5;
  const notchHeight = 10;

  const blockHeight = 40;
  const blockWidth =
    minimumTerminalSpacing * Math.max(block.numInputs, block.numOutputs);

  const topEdgePoints = ([] as { x: number; y: number }[]).concat(
    { x: 0, y: 0 },
    ...Array.from({ length: block.numInputs }).map((_, i) => [
      {
        x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1) - notchHalfWidth,
        y: 0,
      },
      { x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1), y: notchHeight },
      {
        x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1) + notchHalfWidth,
        y: 0,
      },
    ]),
    { x: blockWidth, y: 0 }
  );
  const bottomEdgePoints = ([] as { x: number; y: number }[]).concat(
    { x: 0, y: blockHeight },
    ...Array.from({ length: block.numOutputs }).map((_, i) => [
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) - notchHalfWidth,
        y: blockHeight,
      },
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1),
        y: blockHeight + notchHeight,
      },
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) + notchHalfWidth,
        y: blockHeight,
      },
    ]),
    { x: blockWidth, y: blockHeight }
  );

  const allPoints = [...topEdgePoints, ...[...bottomEdgePoints].reverse()];

  return (
    <g onMouseDown={onMouseDown}>
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={`M ${allPoints.map((p) => `${p.x},${p.y}`).join(" L ")} Z`}
      ></path>
      <text
        className="BlockText"
        x={blockWidth / 2}
        y={(blockHeight + notchHeight) / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        (placeholder)
      </text>
    </g>
  );
}
