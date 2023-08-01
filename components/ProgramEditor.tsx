"use client";
import colors from "tailwindcss/colors";
import { useEffect, useMemo, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import { Program, makeInitialProgram } from "@/model/Program";
import getDescendantsTopologicallySorted from "@/logic/graph/getDescendantsTopologicallySorted";
import calculateProgramLayout from "@/logic/calculateProgramLayout";
import programToNestedDependencyGraph from "@/logic/programToNestedDependencyGraph";
import findRoots from "@/logic/graph/findRoots";
import { produce } from "immer";
import { motion } from "framer-motion";

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
          const { topLeft, center, size } = blockLayouts[blockId];
          return (
            <g key={blockId}>
              <motion.rect
                animate={{ attrX: topLeft.x, attrY: topLeft.y }}
                width={size.width}
                height={size.height}
                rx={10}
                fill={colors.green[100]}
                stroke={colors.green[500]}
                strokeWidth={2}
                onClick={() => {
                  // TODO: This is a temporary handler just to demonstrate the
                  // smooth animations. Remove this once the user can drag
                  // clusters around (#93).
                  setProgram(
                    produce((draft) => {
                      for (const layer of draft.layers) {
                        const index = layer.indexOf(blockId);
                        if (index !== -1) {
                          layer.splice(index, 1);
                          layer.splice(
                            (index + 1) % (layer.length + 1),
                            0,
                            blockId
                          );
                          break;
                        }
                      }
                    })
                  );
                }}
              />
              <motion.text
                animate={{ attrX: center.x, attrY: center.y }}
                fill={colors.green[700]}
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {block.type === "IntegerLiteralBlock" ? block.value : null}
                {block.type === "ReferenceBlock" ? block.name : null}
              </motion.text>
            </g>
          );
        })}
      {lineConnectionEndpoints.map(({ dependencyBlockId, endpoint }, index) => (
        <g key={index}>
          <motion.line
            animate={{
              x1: blockLayouts[dependencyBlockId].output.x,
              y1: blockLayouts[dependencyBlockId].output.y,
              x2: endpoint.x,
              y2: endpoint.y,
            }}
            stroke={colors.black}
            strokeWidth={2}
          />
          <motion.circle
            animate={{ cx: endpoint.x, cy: endpoint.y }}
            r={5}
            fill={colors.black}
          />
        </g>
      ))}
    </ResizingSvg>
  );
}
