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
  const { blockLayouts, lineConnectionLayouts } = useMemo(
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

  const dragOffset = {
    x: mousePosition.x - lastMouseDown.x,
    y: mousePosition.y - lastMouseDown.y,
  };

  const blocksNestedInDraggedBlock = useMemo(() => {
    if (currentlyDraggedBlockId == null) {
      return new Set();
    } else {
      return new Set(
        getDescendantsTopologicallySorted(
          nestedDependencyGraph,
          currentlyDraggedBlockId
        )
      );
    }
  }, [currentlyDraggedBlockId, nestedDependencyGraph]);

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
          const isDraggingThisBlock = blocksNestedInDraggedBlock.has(blockId);
          return (
            <motion.g
              key={blockId}
              animate={{
                x: topLeft.x + (isDraggingThisBlock ? dragOffset.x : 0),
                y: topLeft.y + (isDraggingThisBlock ? dragOffset.y : 0),
                opacity: isDraggingThisBlock ? 0.5 : 1,
              }}
              transition={{
                ...(isDraggingThisBlock
                  ? { x: { duration: 0 }, y: { duration: 0 } }
                  : { x: { type: "tween" }, y: { type: "tween" } }),
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
      {lineConnectionLayouts.map(
        ({ dependencyBlockId, dependentBlockId, endpoint }, index) => {
          const isDraggingDependencyBlock =
            blocksNestedInDraggedBlock.has(dependencyBlockId);
          const isDraggingDependentBlock =
            blocksNestedInDraggedBlock.has(dependentBlockId);

          const startPoint = blockLayouts[dependencyBlockId].output;

          // Since the user might be dragging one of the blocks connected by
          // this line, we may need to adjust the line's start and end points.
          // We do this by adding the drag offset to the start and end points
          // if the corresponding block is being dragged.
          const draggedStartPoint = {
            x: startPoint.x + (isDraggingDependencyBlock ? dragOffset.x : 0),
            y: startPoint.y + (isDraggingDependencyBlock ? dragOffset.y : 0),
          };
          const draggedEndPoint = {
            x: endpoint.x + (isDraggingDependentBlock ? dragOffset.x : 0),
            y: endpoint.y + (isDraggingDependentBlock ? dragOffset.y : 0),
          };

          return (
            <motion.g
              key={index}
              animate={{
                opacity:
                  isDraggingDependencyBlock || isDraggingDependentBlock
                    ? 0.25
                    : 1,
              }}
            >
              <motion.line
                animate={{
                  x1: draggedStartPoint.x,
                  y1: draggedStartPoint.y,
                  x2: draggedEndPoint.x,
                  y2: draggedEndPoint.y,
                }}
                transition={{
                  ...(isDraggingDependencyBlock
                    ? { x1: { duration: 0 }, y1: { duration: 0 } }
                    : { x1: "easeOut", y1: "easeOut" }),
                  ...(isDraggingDependentBlock
                    ? { x2: { duration: 0 }, y2: { duration: 0 } }
                    : { x2: "easeOut", y2: "easeOut" }),
                }}
                stroke={colors.black}
                strokeWidth={2}
              />
              <motion.circle
                animate={{
                  cx: draggedEndPoint.x,
                  cy: draggedEndPoint.y,
                }}
                transition={{
                  ...(isDraggingDependentBlock
                    ? { cx: { duration: 0 }, cy: { duration: 0 } }
                    : { cx: "easeOut", cy: "easeOut" }),
                }}
                r={5}
                fill={colors.black}
              />
            </motion.g>
          );
        }
      )}
    </ResizingSvg>
  );
}
