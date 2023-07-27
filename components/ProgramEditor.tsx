"use client";
import colors from "tailwindcss/colors";
import CenteredRect from "./CenteredRect";
import { useEffect, useMemo, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import {
  Program,
  calculateLayout,
  makeInitialProgram,
  programToDependencyGraph,
} from "@/model/Program";
import reverseGraph from "@/logic/graph/reverseGraph";
import getDescendantsTopologicallySorted from "@/logic/graph/getDescendantsTopologicallySorted";

export default function ProgramEditor() {
  const [program, setProgram] = useState<Program>({ blocks: {} });
  useEffect(() => {
    setProgram(makeInitialProgram());
  }, []);
  const layout = useMemo(() => calculateLayout(program), [program]);
  const allBlockIds = Object.keys(program.blocks);
  const dependencyGraph = programToDependencyGraph(program);
  const dependentGraph = reverseGraph(dependencyGraph);
  const rootNodeIds = allBlockIds.filter(
    (nodeId) => dependentGraph[nodeId].length === 0
  );

  return (
    <ResizingSvg>
      {rootNodeIds
        .flatMap((rootNodeId) =>
          getDescendantsTopologicallySorted(dependencyGraph, rootNodeId, true)
        )
        .map((blockId) => {
          const block = program.blocks[blockId];
          const { center, size } = layout[blockId];
          return (
            <g key={blockId}>
              <CenteredRect
                x={center.x}
                y={center.y}
                width={size.width}
                height={size.height}
                rx={5}
                fill={colors.green[100]}
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
