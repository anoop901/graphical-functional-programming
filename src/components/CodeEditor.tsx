import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import Block from "../block/Block";

interface DragState {
  blockId: string;
  offset: { x: number; y: number };
}

export default function CodeEditor({
  programLayout,
  setProgramLayout,
}: {
  programLayout: ProgramLayout;
  setProgramLayout: (programLayout: ProgramLayout) => void;
}) {
  const [dragState, setDragState] = React.useState<DragState | undefined>(
    undefined
  );
  const svgRef = React.useRef<SVGSVGElement>(null);
  return (
    <svg
      ref={svgRef}
      className="CodeEditor"
      onMouseMove={(e) => {
        if (dragState !== undefined) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current!);
          setProgramLayout(
            programLayout.moveBlock(dragState.blockId, {
              x: mouseLocation.x - dragState.offset.x,
              y: mouseLocation.y - dragState.offset.y,
            })
          );
        }
      }}
      onMouseUp={(e) => {
        setDragState(undefined);
      }}
      onMouseLeave={(e) => {
        setDragState(undefined);
      }}
    >
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
              <BlockInEditor
                block={block}
                onMouseDown={(e) => {
                  const mouseLocation = mouseEventToSvgPoint(
                    e,
                    svgRef.current!
                  );

                  setDragState({
                    blockId,
                    offset: {
                      x: mouseLocation.x - blockPosition.x,
                      y: mouseLocation.y - blockPosition.y,
                    },
                  });
                }}
              />
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

function BlockInEditor({
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

/**
 * Returns the coordinates where the MouseEvent `event` occurred relative to the
 * coordinate system of `svgElem`.
 */
function mouseEventToSvgPoint(
  event: React.MouseEvent,
  svgElem: SVGSVGElement
): { x: number; y: number } {
  const eventPoint = svgElem.createSVGPoint();
  eventPoint.x = event.clientX;
  eventPoint.y = event.clientY;
  const svgPoint = eventPoint.matrixTransform(
    svgElem.getScreenCTM()!.inverse()
  );
  return { x: svgPoint.x, y: svgPoint.y };
}
