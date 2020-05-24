import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import Block from "../block/Block";

export default function CodeEditor({
  programLayout,
}: {
  programLayout: ProgramLayout;
}) {
  return (
    <svg className="CodeEditor">
      {programLayout.program.blocks
        .map((block, blockId) => {
          const blockPosition = programLayout.blockLocations.get(blockId);
          if (blockPosition === undefined) {
            throw new Error(
              `ProgramLayout had no position for block id ${blockId}`
            );
          }
          return (
            <g
              key={blockId}
              transform={`translate(${blockPosition.x} ${blockPosition.y})`}
            >
              {renderBlock(block)}
            </g>
          );
        })
        .toList()}
      {programLayout.program.connections
        .map((connection, connectionId) => {
          const sourceBlockLocation = programLayout.blockLocations.get(
            connection.sourceBlockId
          )!;
          const destinationBlockLocation = programLayout.blockLocations.get(
            connection.destinationBlockId
          )!;
          return (
            <path
              key={connectionId}
              d={`M ${
                sourceBlockLocation.x +
                connection.sourceBlockOutputIndex * 50 +
                25
              } ${sourceBlockLocation.y + 50} C ${
                sourceBlockLocation.x +
                connection.sourceBlockOutputIndex * 50 +
                25
              } ${sourceBlockLocation.y + 150} ${
                destinationBlockLocation.x +
                connection.destinationBlockInputIndex * 50 +
                25
              } ${destinationBlockLocation.y + 10 - 100} ${
                destinationBlockLocation.x +
                connection.destinationBlockInputIndex * 50 +
                25
              } ${destinationBlockLocation.y + 10}`}
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            ></path>
          );
        })
        .toList()}
    </svg>
  );
}

function renderBlock(block: Block): JSX.Element {
  const hue = block.numInputs > 0 && block.numOutputs > 0 ? 200 : 120;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const minimumTerminalSpacing = 50;
  const notchHalfWidth = 5;
  const notchHeight = 10;

  const blockHeight = 40;
  const blockWidth =
    minimumTerminalSpacing * Math.max(block.numInputs, block.numOutputs);

  const topEdgePoints = Array().concat(
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
  const bottomEdgePoints = Array().concat(
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
    <g>
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
