import * as React from "react";
import { notchHalfWidth, notchHeight, blockHeight } from "../constants";
import buildSvgPath from "../BuildSvgPath";
import { BlockPartOffsets } from "./BlockInEditor";
import "./DefinitionBlockInEditor.css";
import DefinitionBlock from "../block/DefinitionBlock";

const blockWidth = 100;

export default function DefinitionBlockInEditor({
  block,
  onMouseDown,
  location,
  setBlock,
}: {
  block: DefinitionBlock;
  onMouseDown?: (e: React.MouseEvent) => void;
  location: { x: number; y: number };
  setBlock: (block: DefinitionBlock) => void;
}): JSX.Element {
  const strokeColor = `hsl(0,0%,40%)`;
  const fillColor = `hsl(0,0%,60%)`;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [editing, setEditing] = React.useState(false);
  function stopEditing() {
    setEditing(false);
    if (inputRef.current) {
      setBlock(new DefinitionBlock(inputRef.current.value));
    }
  }

  return (
    <g
      className="DefinitionBlockInEditor"
      // TODO: Maybe use onDoubleClick to decide whether to recalculate
      onMouseDown={onMouseDown}
      onDoubleClick={() => {
        setEditing(true);
      }}
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
        {block.name}
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
