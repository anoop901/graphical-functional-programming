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
import { produce } from "immer";

const LAYER_MARGIN = 20;
const CLUSTER_MARGIN = 30;

export default function ProgramEditor() {
  const [program, setProgram] = useState<Program>({ blocks: {}, layers: [] });
  useEffect(() => {
    setProgram(makeInitialProgram());
  }, []);
  const { blockLayouts, lineConnectionLayouts, layerIntervals } = useMemo(
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

  type InsertionLocation =
    | {
        type: "betweenLayers";
        layerIndex: number;
      }
    | {
        type: "betweenClustersWithinLayer";
        layerIndex: number;
        index: number;
      };

  const insertionLocation: InsertionLocation = useMemo(() => {
    const layerIndex = layerIntervals.findIndex(
      ({ left, right }) =>
        left - LAYER_MARGIN <= mousePosition.y &&
        mousePosition.y <= right + LAYER_MARGIN
    );
    if (layerIndex < 0) {
      const layerIndex = layerIntervals.findIndex(
        ({ left }) => mousePosition.y < left - LAYER_MARGIN
      );
      return {
        type: "betweenLayers",
        layerIndex: layerIndex < 0 ? program.layers.length : layerIndex,
      };
    }
    const layer = program.layers[layerIndex];
    const blockIndex = layer.findIndex((blockId) => {
      return blockLayouts[blockId].center.x > mousePosition.x;
    });
    if (blockIndex < 0) {
      return {
        type: "betweenClustersWithinLayer",
        layerIndex: layerIndex,
        index: layer.length,
      };
    }
    return {
      type: "betweenClustersWithinLayer",
      layerIndex: layerIndex,
      index: blockIndex,
    };
  }, [program.layers, blockLayouts, layerIntervals, mousePosition]);

  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <ResizingSvg
      svgRef={svgRef}
      onMouseDown={() => {
        setLastMouseDown(mousePosition);
      }}
      onMouseUp={() => {
        if (currentlyDraggedBlockId != null) {
          setProgram(
            produce((draft) => {
              const insertionLocationAfterRemove = { ...insertionLocation };

              // Remove the dragged block from its current location in layers.
              for (
                let layerIndex = 0;
                layerIndex < draft.layers.length;
                layerIndex++
              ) {
                const layer = draft.layers[layerIndex];
                const index = layer.indexOf(currentlyDraggedBlockId);
                if (index >= 0) {
                  layer.splice(index, 1);
                  // Adjust the insertion location if the block was removed from
                  // a location in the same layer before where it will be
                  // inserted.
                  if (
                    insertionLocationAfterRemove.type ===
                      "betweenClustersWithinLayer" &&
                    insertionLocationAfterRemove.layerIndex === layerIndex &&
                    insertionLocationAfterRemove.index > index
                  ) {
                    insertionLocationAfterRemove.index--;
                  }
                  break;
                }
              }

              // Add the dragged block to its new location in layers.
              draft.blocks[currentlyDraggedBlockId].nested = false;
              if (insertionLocationAfterRemove.type === "betweenLayers") {
                draft.layers.splice(
                  insertionLocationAfterRemove.layerIndex,
                  0,
                  [currentlyDraggedBlockId]
                );
              } else {
                draft.layers[insertionLocationAfterRemove.layerIndex].splice(
                  insertionLocationAfterRemove.index,
                  0,
                  currentlyDraggedBlockId
                );
              }

              // Remove any empty layers.
              draft.layers = draft.layers.filter((layer) => layer.length > 0);
            })
          );
        }

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
      {(() => {
        // Don't render a line here if we are not currently dragging a block.
        if (currentlyDraggedBlockId == null) {
          return null;
        }
        // Don't render a line here if the insertion point is adjacent to the
        // original location of the dragged block.
        if (
          insertionLocation.type === "betweenClustersWithinLayer" &&
          program.layers[insertionLocation.layerIndex].includes(
            currentlyDraggedBlockId
          )
        ) {
          const originalIndex = program.layers[
            insertionLocation.layerIndex
          ].indexOf(currentlyDraggedBlockId);
          if (
            [originalIndex, originalIndex + 1].includes(insertionLocation.index)
          ) {
            return null;
          }
        }
        if (insertionLocation.type === "betweenClustersWithinLayer") {
          const x =
            insertionLocation.index === 0
              ? blockLayouts[program.layers[insertionLocation.layerIndex][0]]
                  .topLeft.x - CLUSTER_MARGIN
              : insertionLocation.index ===
                program.layers[insertionLocation.layerIndex].length
              ? blockLayouts[
                  program.layers[insertionLocation.layerIndex][
                    program.layers[insertionLocation.layerIndex].length - 1
                  ]
                ].bottomRight.x + CLUSTER_MARGIN
              : (blockLayouts[
                  program.layers[insertionLocation.layerIndex][
                    insertionLocation.index - 1
                  ]
                ].bottomRight.x +
                  blockLayouts[
                    program.layers[insertionLocation.layerIndex][
                      insertionLocation.index
                    ]
                  ].topLeft.x) /
                2;
          return (
            <motion.line
              x1={x}
              x2={x}
              y1={
                layerIntervals[insertionLocation.layerIndex].left - LAYER_MARGIN
              }
              y2={
                layerIntervals[insertionLocation.layerIndex].right +
                LAYER_MARGIN
              }
              stroke="black"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.2}
            />
          );
        } else {
          let y = 0;
          if (layerIntervals.length === 0) {
            y = 0;
          } else {
            if (insertionLocation.layerIndex === 0) {
              y = layerIntervals[0].left - CLUSTER_MARGIN;
            } else if (insertionLocation.layerIndex < layerIntervals.length) {
              y =
                (layerIntervals[insertionLocation.layerIndex - 1].right +
                  layerIntervals[insertionLocation.layerIndex].left) /
                2;
            } else {
              y =
                layerIntervals[layerIntervals.length - 1].right +
                CLUSTER_MARGIN;
            }
          }
          return (
            <motion.line
              x1={-100}
              x2={100}
              y1={y}
              y2={y}
              stroke="black"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.2}
            />
          );
        }
      })()}

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
