import * as React from "react";
import {
  notchHalfWidth,
  notchHeight,
  blockHeight,
  inputOutputBlockSpikeLength,
} from "../constants";
import buildSvgPath from "../BuildSvgPath";
import "./NumberInputBlockInEditor.css";
import { BlockPartOffsets } from "./BlockInEditor";

const blockWidth = 50;

export default function NumberOutputBlockInEditor({
  value,
  onMouseDown,
  location,
}: {
  value: number | null;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const hue = 30;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  return (
    <g
      className="NumberOutputBlockInEditor"
      // TODO: Maybe use onDoubleClick to decide whether to recalculate
      onMouseDown={onMouseDown}
      transform={`translate(${location.x} ${location.y})`}
    >
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={buildSvgPath(
          [
            { type: "move" as const, to: { x: 0, y: 0 } },
            {
              type: "line" as const,
              to: { x: blockWidth / 2 - notchHalfWidth, y: 0 },
            },
            {
              type: "line" as const,
              to: { x: blockWidth / 2, y: notchHeight },
            },
            {
              type: "line" as const,
              to: { x: blockWidth / 2 + notchHalfWidth, y: 0 },
            },
            { type: "line" as const, to: { x: blockWidth, y: 0 } },
            {
              type: "line" as const,
              to: {
                x: blockWidth + inputOutputBlockSpikeLength,
                y: blockHeight / 2,
              },
            },
            { type: "line" as const, to: { x: blockWidth, y: blockHeight } },
            { type: "line" as const, to: { x: 0, y: blockHeight } },
            {
              type: "line" as const,
              to: {
                x: -inputOutputBlockSpikeLength,
                y: blockHeight / 2,
              },
            },
          ],
          true
        )}
      ></path>
      <text
        className="blocklabel"
        alignmentBaseline="text-after-edge"
        textAnchor="middle"
        x={blockWidth / 2}
        y={blockHeight}
      >
        output
      </text>
      <text
        x={blockWidth / 2}
        y={blockHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {value === null ? "---" : value}
      </text>
    </g>
  );
}
export function getNumberOutputBlockPartOffsets(): BlockPartOffsets {
  return {
    getInputOffset(inputIndex: number): { dx: number; dy: number } {
      if (inputIndex !== 0) {
        throw new Error(`output index ${inputIndex} out of bounds`);
      }
      return { dx: blockWidth / 2, dy: notchHeight };
    },
    getOutputOffset(): { dx: number; dy: number } {
      throw new Error("number output block has no inputs");
    },
  };
}
