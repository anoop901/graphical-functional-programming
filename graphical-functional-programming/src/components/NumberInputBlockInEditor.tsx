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

export default function NumberInputBlockInEditor({
  value,
  setValue,
  onMouseDown,
  location,
}: {
  value: number;
  setValue: (value: number) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const hue = 30;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const [editing, setEditing] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  function stopEditing() {
    setEditing(false);
    if (inputRef.current) {
      const newNumber = parseFloat(inputRef.current.value);
      if (!isNaN(newNumber)) {
        setValue(newNumber);
      }
    }
  }

  return (
    <g
      className="NumberInputBlockInEditor"
      onDoubleClick={() => {
        setEditing(true);
      }}
      onMouseDown={onMouseDown}
      transform={`translate(${location.x} ${location.y})`}
    >
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={buildSvgPath(
          [
            { type: "move" as const, to: { x: 0, y: 0 } },
            { type: "line" as const, to: { x: blockWidth, y: 0 } },
            {
              type: "line" as const,
              to: {
                x: blockWidth + inputOutputBlockSpikeLength,
                y: blockHeight / 2,
              },
            },
            { type: "line" as const, to: { x: blockWidth, y: blockHeight } },
            {
              type: "line" as const,
              to: { x: blockWidth / 2 + notchHalfWidth, y: blockHeight },
            },
            {
              type: "line" as const,
              to: { x: blockWidth / 2, y: blockHeight + notchHeight },
            },
            {
              type: "line" as const,
              to: { x: blockWidth / 2 - notchHalfWidth, y: blockHeight },
            },
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
        alignmentBaseline="text-before-edge"
        textAnchor="middle"
        x={blockWidth / 2}
        y={0}
      >
        input
      </text>
      <text
        x={blockWidth / 2}
        y={blockHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {value}
      </text>
      {editing ? (
        <foreignObject x={0} y={0} width={blockWidth} height={blockHeight}>
          <form
            onSubmit={(e) => {
              stopEditing();
              e.preventDefault();
            }}
          >
            <input
              type="text"
              ref={inputRef}
              autoFocus
              onBlur={() => {
                stopEditing();
              }}
            ></input>
          </form>
        </foreignObject>
      ) : null}
    </g>
  );
}
export function getNumberInputBlockPartOffsets(): BlockPartOffsets {
  return {
    getInputOffset(): { dx: number; dy: number } {
      throw new Error("number input block has no inputs");
    },
    getOutputOffset(outputIndex: number): { dx: number; dy: number } {
      if (outputIndex !== 0) {
        throw new Error(`output index ${outputIndex} out of bounds`);
      }
      return { dx: blockWidth / 2, dy: blockHeight + notchHeight };
    },
  };
}
