"use client";
import colors from "tailwindcss/colors";
import CenteredRect from "./CenteredRect";
import { useEffect, useMemo, useRef, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import { Program, calculateLayout, makeInitialProgram } from "@/model/Program";

export default function ProgramEditor() {
  const center = { x: 0, y: 0 };

  const [program, setProgram] = useState<Program>({ blocks: {} });
  useEffect(() => {
    setProgram(makeInitialProgram());
  }, []);

  const layout = useMemo(() => calculateLayout(program), [program]);

  return (
    <ResizingSvg>
      {Object.entries(layout).map(([blockId, { size, center }]) => {
        const block = program.blocks[blockId];
        return (
          <g key={blockId}>
            <CenteredRect
              x={center.x}
              y={center.y}
              width={size.width}
              height={size.height}
              rx={5}
              fill="none"
              stroke={colors.green[500]}
              strokeWidth={1}
            />
            <text
              x={center.x}
              y={center.y}
              fill={colors.green[800]}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {block.type === "IntegerLiteralBlock" ? block.value : null}
              {block.type === "ReferenceBlock" ? block.name : null}
            </text>
          </g>
        );
      })}
    </ResizingSvg>
  );
}
