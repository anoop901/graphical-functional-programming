import * as React from "react";
import FunctionBlock from "../block/function/FunctionBlock";
import {
  minimumTerminalSpacing,
  notchHalfWidth,
  notchHeight,
  blockHeight,
  functionBlockRoundPartLength,
} from "../constants";
import buildSvgPath from "../BuildSvgPath";

export default function FunctionBlockInEditor({
  block,
  onMouseDown,
  location,
}: {
  block: FunctionBlock;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const hue = block.numInputs > 0 && block.numOutputs > 0 ? 200 : 120;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const blockWidth =
    minimumTerminalSpacing * Math.max(block.numInputs, block.numOutputs);

  const topEdgePoints = ([] as { x: number; y: number }[]).concat(
    { x: functionBlockRoundPartLength, y: 0 },
    ...Array.from({ length: block.numInputs }).map((_, i) => [
      {
        x:
          functionBlockRoundPartLength +
          (blockWidth / (2 * block.numInputs)) * (2 * i + 1) -
          notchHalfWidth,
        y: 0,
      },
      {
        x:
          functionBlockRoundPartLength +
          (blockWidth / (2 * block.numInputs)) * (2 * i + 1),
        y: notchHeight,
      },
      {
        x:
          functionBlockRoundPartLength +
          (blockWidth / (2 * block.numInputs)) * (2 * i + 1) +
          notchHalfWidth,
        y: 0,
      },
    ]),
    { x: functionBlockRoundPartLength + blockWidth, y: 0 }
  );
  const bottomEdgePoints = ([] as { x: number; y: number }[])
    .concat(
      { x: functionBlockRoundPartLength, y: blockHeight },
      ...Array.from({ length: block.numOutputs }).map((_, i) => [
        {
          x:
            functionBlockRoundPartLength +
            (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) -
            notchHalfWidth,
          y: blockHeight,
        },
        {
          x:
            functionBlockRoundPartLength +
            (blockWidth / (2 * block.numOutputs)) * (2 * i + 1),
          y: blockHeight + notchHeight,
        },
        {
          x:
            functionBlockRoundPartLength +
            (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) +
            notchHalfWidth,
          y: blockHeight,
        },
      ]),
      { x: functionBlockRoundPartLength + blockWidth, y: blockHeight }
    )
    .reverse();
  return (
    <g
      onMouseDown={onMouseDown}
      transform={`translate(${location.x} ${location.y})`}
    >
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={buildSvgPath([
          { type: "move" as const, to: topEdgePoints[0] },
          ...topEdgePoints
            .slice(1)
            .map((p) => ({ type: "line" as const, to: p })),
          {
            type: "curve" as const,
            anchor1: {
              x:
                functionBlockRoundPartLength +
                blockWidth +
                (functionBlockRoundPartLength * 4) / 3,
              y: 0,
            },
            anchor2: {
              x:
                blockWidth +
                functionBlockRoundPartLength +
                (functionBlockRoundPartLength * 4) / 3,
              y: blockHeight,
            },
            to: bottomEdgePoints[0],
          },
          ...bottomEdgePoints.map((p) => ({ type: "line" as const, to: p })),
          {
            type: "curve" as const,
            anchor1: {
              x:
                functionBlockRoundPartLength -
                (functionBlockRoundPartLength * 4) / 3,
              y: blockHeight,
            },
            anchor2: {
              x:
                functionBlockRoundPartLength -
                (functionBlockRoundPartLength * 4) / 3,
              y: 0,
            },
            to: topEdgePoints[0],
          },
        ])}
      ></path>
      <text
        className="BlockText"
        x={functionBlockRoundPartLength + blockWidth / 2}
        y={(blockHeight + notchHeight) / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        (placeholder)
      </text>
    </g>
  );
}
