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

function getBlockWidthExceptRoundPart(block: FunctionBlock) {
  return minimumTerminalSpacing * Math.max(block.numInputs, block.numOutputs);
}

export default function FunctionBlockInEditor({
  block,
  onMouseDown,
  location,
}: {
  block: FunctionBlock;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const hue = 200;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const blockWidthExceptRoundPart = getBlockWidthExceptRoundPart(block);

  const topEdgePoints = ([] as { x: number; y: number }[]).concat(
    { x: functionBlockRoundPartLength, y: 0 },
    ...Array.from({ length: block.numInputs }).map((_, i) => [
      {
        x:
          functionBlockRoundPartLength +
          (blockWidthExceptRoundPart / (2 * block.numInputs)) * (2 * i + 1) -
          notchHalfWidth,
        y: 0,
      },
      {
        x:
          functionBlockRoundPartLength +
          (blockWidthExceptRoundPart / (2 * block.numInputs)) * (2 * i + 1),
        y: notchHeight,
      },
      {
        x:
          functionBlockRoundPartLength +
          (blockWidthExceptRoundPart / (2 * block.numInputs)) * (2 * i + 1) +
          notchHalfWidth,
        y: 0,
      },
    ]),
    { x: functionBlockRoundPartLength + blockWidthExceptRoundPart, y: 0 }
  );
  const bottomEdgePoints = ([] as { x: number; y: number }[])
    .concat(
      { x: functionBlockRoundPartLength, y: blockHeight },
      ...Array.from({ length: block.numOutputs }).map((_, i) => [
        {
          x:
            functionBlockRoundPartLength +
            (blockWidthExceptRoundPart / (2 * block.numOutputs)) * (2 * i + 1) -
            notchHalfWidth,
          y: blockHeight,
        },
        {
          x:
            functionBlockRoundPartLength +
            (blockWidthExceptRoundPart / (2 * block.numOutputs)) * (2 * i + 1),
          y: blockHeight + notchHeight,
        },
        {
          x:
            functionBlockRoundPartLength +
            (blockWidthExceptRoundPart / (2 * block.numOutputs)) * (2 * i + 1) +
            notchHalfWidth,
          y: blockHeight,
        },
      ]),
      {
        x: functionBlockRoundPartLength + blockWidthExceptRoundPart,
        y: blockHeight,
      }
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
                blockWidthExceptRoundPart +
                (functionBlockRoundPartLength * 4) / 3,
              y: 0,
            },
            anchor2: {
              x:
                blockWidthExceptRoundPart +
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
        x={functionBlockRoundPartLength + blockWidthExceptRoundPart / 2}
        y={(blockHeight + notchHeight) / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        (placeholder)
      </text>
    </g>
  );
}

export function getFunctionBlockInputRelativeLocation(
  block: FunctionBlock,
  inputIndex: number
): { x: number; y: number } {
  const blockWidthExceptRoundPart = getBlockWidthExceptRoundPart(block);
  return {
    x:
      functionBlockRoundPartLength +
      (blockWidthExceptRoundPart / (2 * block.numInputs)) *
        (2 * inputIndex + 1),
    y: notchHeight,
  };
}

export function getFunctionBlockOutputRelativeLocation(
  block: FunctionBlock,
  outputIndex: number
): { x: number; y: number } {
  const blockWidthExceptRoundPart = getBlockWidthExceptRoundPart(block);
  return {
    x:
      functionBlockRoundPartLength +
      (blockWidthExceptRoundPart / (2 * block.numOutputs)) *
        (2 * outputIndex + 1),
    y: blockHeight + notchHeight,
  };
}
