import * as React from "react";
import {
  notchHalfWidth,
  notchHeight,
  blockHeight,
  inputOutputBlockSpikeLength,
} from "../constants";
import buildSvgPath from "../BuildSvgPath";
import { BlockPartOffsets } from "./BlockInEditor";

const blockWidth = 100;

export default function DefinitionBlockInEditor({
  name,
  onMouseDown,
  location,
}: {
  name: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const strokeColor = `hsl(0,0%,40%)`;
  const fillColor = `hsl(0,0%,60%)`;

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
            { type: "line" as const, to: { x: blockWidth, y: blockHeight } },
            { type: "line" as const, to: { x: 0, y: blockHeight } },
          ],
          true
        )}
      ></path>
      <text
        className="blocklabel"
        alignmentBaseline="text-before-edge"
        textAnchor="middle"
        x={blockWidth / 2}
        y={notchHeight}
      >
        define
      </text>
      <text
        x={blockWidth / 2}
        y={blockHeight}
        alignmentBaseline="text-after-edge"
        textAnchor="middle"
      >
        {name}
      </text>
    </g>
  );
}
export function getDefinitionBlockPartOffsets(): BlockPartOffsets {
  return {
    getInputOffset(inputIndex: number): { dx: number; dy: number } {
      if (inputIndex !== 0) {
        throw new Error(`output index ${inputIndex} out of bounds`);
      }
      return { dx: blockWidth / 2, dy: notchHeight };
    },
    getOutputOffset(): { dx: number; dy: number } {
      throw new Error("definition block has no inputs");
    },
  };
}
