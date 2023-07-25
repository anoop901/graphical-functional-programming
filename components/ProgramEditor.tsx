"use client";
import colors from "tailwindcss/colors";
import CenteredRect from "./CenteredRect";
import { useEffect, useRef, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import { Program, calculateLayout, makeInitialProgram } from "@/model/Program";

export default function ProgramEditor() {
  const center = { x: 0, y: 0 };

  const [program, setProgram] = useState<Program>({ blocks: {} });
  useEffect(() => {
    setProgram(makeInitialProgram());
  }, []);

  useEffect(() => {
    console.log(program);
    console.log(calculateLayout(program));
  }, [program]);

  return (
    <ResizingSvg>
      <CenteredRect
        x={center.x}
        y={center.y}
        width={100}
        height={25}
        rx={5}
        fill={colors.green[200]}
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
        foo
      </text>
    </ResizingSvg>
  );
}
