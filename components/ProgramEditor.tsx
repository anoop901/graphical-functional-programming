"use client";
import colors from "tailwindcss/colors";
import CenteredRect from "./CenteredRect";
import { useEffect, useMemo, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import { Program, makeInitialProgram } from "@/model/Program";
import getDescendantsTopologicallySorted from "@/logic/graph/getDescendantsTopologicallySorted";
import calculateProgramLayout from "@/logic/calculateProgramLayout";
import programToNestedDependencyGraph from "@/logic/programToNestedDependencyGraph";
import findRoots from "@/logic/graph/findRoots";

export default function ProgramEditor() {
  const [program, setProgram] = useState<Program>({ blocks: {}, layers: [] });
  useEffect(() => {
    setProgram(makeInitialProgram());
  }, []);
  const { blockLayouts, lineConnectionEndpoints } = useMemo(
    () => calculateProgramLayout(program),
    [program]
  );
  const nestedDependencyGraph = programToNestedDependencyGraph(program);
  const clusterRootBlockIds = findRoots(nestedDependencyGraph);

  return (
    <ResizingSvg>
      {clusterRootBlockIds
        .flatMap((clusterRootBlockId) =>
          getDescendantsTopologicallySorted(
            nestedDependencyGraph,
            clusterRootBlockId,
            true
          )
        )
        .map((blockId) => {
          const block = program.blocks[blockId];
          const { center, size } = blockLayouts[blockId];
          return (
            <g key={blockId}>
              <CenteredRect
                x={center.x}
                y={center.y}
                width={size.width}
                height={size.height}
                rx={10}
                fill={colors.green[100]}
                stroke={colors.green[500]}
                strokeWidth={2}
              />
              <text
                x={center.x}
                y={center.y}
                fill={colors.green[700]}
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {block.type === "IntegerLiteralBlock" ? block.value : null}
                {block.type === "ReferenceBlock" ? block.name : null}
              </text>
            </g>
          );
        })}
      {lineConnectionEndpoints.map(({ dependencyBlockId, endpoint }, index) => (
        <g key={index}>
          <line
            x1={blockLayouts[dependencyBlockId].output.x}
            y1={blockLayouts[dependencyBlockId].output.y}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke={colors.black}
            strokeWidth={2}
          />
          <circle cx={endpoint.x} cy={endpoint.y} r={5} fill={colors.black} />
        </g>
      ))}
    </ResizingSvg>
  );
}
