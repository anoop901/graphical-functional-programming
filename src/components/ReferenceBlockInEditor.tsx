import * as React from "react";
import { notchHalfWidth, notchHeight, blockHeight } from "../constants";
import buildSvgPath from "../BuildSvgPath";
import "./ReferenceBlockInEditor.css";
import { BlockPartOffsets } from "./BlockInEditor";
import ReferenceBlock from "../block/ReferenceBlock";

const blockWidth = 50;

export default function ReferenceBlockInEditor({
  block,
  onMouseDown,
  location,
}: {
  block: ReferenceBlock;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
}): JSX.Element {
  const strokeColor = `hsl(0,0%,40%)`;
  const fillColor = `hsl(0,0%,60%)`;

  const [editing, setEditing] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  function stopEditing() {
    setEditing(false);
    if (inputRef.current) {
      // TODO
    }
  }

  return (
    <g
      className="ReferenceBlockInEditor"
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
          ],
          true
        )}
      ></path>
      <text
        x={blockWidth / 2}
        y={blockHeight / 2}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        foo {/* TODO */}
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
export function getReferenceBlockPartOffsets(): BlockPartOffsets {
  return {
    getInputOffset(): { dx: number; dy: number } {
      throw new Error("number literal block has no inputs");
    },
    getOutputOffset(outputIndex: number): { dx: number; dy: number } {
      if (outputIndex !== 0) {
        throw new Error(`output index ${outputIndex} out of bounds`);
      }
      return { dx: blockWidth / 2, dy: blockHeight + notchHeight };
    },
  };
}
