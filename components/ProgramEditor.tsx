"use client";
import colors from "tailwindcss/colors";
import { useEffect, useMemo, useRef, useState } from "react";
import ResizingSvg from "./ResizingSvg";
import { Program, makeInitialProgram } from "@/model/Program";
import getDescendantsTopologicallySorted from "@/logic/graph/getDescendantsTopologicallySorted";
import calculateProgramLayout from "@/logic/calculateProgramLayout";
import programToNestedDependencyGraph from "@/logic/programToNestedDependencyGraph";
import findRoots from "@/logic/graph/findRoots";
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

  const nestedDependencyGraph = useMemo(
    () => programToNestedDependencyGraph(program),
    [program]
  );
  const clusterRootBlockIds = useMemo(
    () => findRoots(nestedDependencyGraph),
    [nestedDependencyGraph]
  );

  const [currentlyDraggedBlockId, setCurrentlyDraggedBlockId] = useState<
    string | null
  >(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [lastMouseDown, setLastMouseDown] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <ResizingSvg
      svgRef={svgRef}
      onMouseDown={() => {
        setLastMouseDown(mousePosition);
      }}
      onMouseUp={() => {
        setCurrentlyDraggedBlockId(null);
      }}
      onMouseMove={(e) => {
        const svg = svgRef.current;
        if (svg != null) {
          const clientPoint = new DOMPoint(e.clientX, e.clientY);
          const screenCTM = svg.getScreenCTM();
          if (screenCTM != null) {
            // TODO: Find a way to cache this inverse matrix so we don't have to
            // recalculate it on every mousemove event.
            const svgPoint = clientPoint.matrixTransform(screenCTM.inverse());
            setMousePosition({
              x: svgPoint.x,
              y: svgPoint.y,
            });
          }
        }
      }}
    >
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
          const { topLeft, size } = blockLayouts[blockId];
          const isDraggingThisBlock = currentlyDraggedBlockId === blockId;
          const dragOffset = isDraggingThisBlock
            ? {
                x: mousePosition.x - lastMouseDown.x,
                y: mousePosition.y - lastMouseDown.y,
              }
            : { x: 0, y: 0 };
          return (
            <motion.g
              key={blockId}
              animate={{
                x: topLeft.x + dragOffset.x,
                y: topLeft.y + dragOffset.y,
                opacity: isDraggingThisBlock ? 0.5 : 1,
                scale: isDraggingThisBlock ? 1.1 : 1,
              }}
              transition={{
                x: { duration: isDraggingThisBlock ? 0 : 0.2 },
                y: { duration: isDraggingThisBlock ? 0 : 0.2 },
                scale: { type: "spring" },
              }}
              initial={false}
              onMouseDown={() => {
                setCurrentlyDraggedBlockId(blockId);
              }}
            >
              <rect
                width={size.width}
                height={size.height}
                rx={10}
                fill={colors.green[100]}
                stroke={colors.green[500]}
                strokeWidth={2}
              />
              <text
                x={size.width / 2}
                y={size.height / 2}
                fill={colors.green[700]}
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {block.type === "IntegerLiteralBlock" ? block.value : null}
                {block.type === "ReferenceBlock" ? block.name : null}
              </text>
            </motion.g>
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
