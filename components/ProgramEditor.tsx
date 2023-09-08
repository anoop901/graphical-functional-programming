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
import useMouse from "@/hooks/useMouse";
import InsertionLocation from "@/model/InsertionLocation";
import calculateInsertionLocation from "@/logic/calculateInsertionLocation";
import moveBlockToNewLocationAsClusterRoot from "@/logic/moveBlockToNewLocationAsClusterRoot";
import InsertionLocationPreview from "./InsertionLocationPreview";
import BlockInEditor from "./BlockInEditor";
import LineConnectionInEditor from "./LineConnectionInEditor";

export default function ProgramEditor() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [program, setProgram] = useState<Program>({ blocks: {}, layers: [] });
  useEffect(() => {
    // program must be initialized in useEffect instead of useState because
    // makeInitialProgram() depends on the window object, which is not available
    // during server-side rendering.
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

  const blocksNestedInDraggedBlock = useMemo(() => {
    if (currentlyDraggedBlockId == null) {
      return new Set<string>();
    } else {
      return new Set(
        getDescendantsTopologicallySorted(
          nestedDependencyGraph,
          currentlyDraggedBlockId
        )
      );
    }
  }, [currentlyDraggedBlockId, nestedDependencyGraph]);

  const { mousePosition, dragOffset, onMouseDown, onMouseMove } =
    useMouse(svgRef);

  const insertionLocation: InsertionLocation = useMemo(
    () =>
      calculateInsertionLocation(
        layerIntervals,
        blockLayouts,
        program.layers,
        mousePosition
      ),
    [layerIntervals, blockLayouts, program.layers, mousePosition]
  );

  const renderInsertionLocationPreview = useMemo(() => {
    // Don't render insertion location if we are not currently dragging a block.
    if (currentlyDraggedBlockId == null) {
      return false;
    }
    // Don't render insertion location if it is adjacent to the original
    // location of the dragged block.
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
        return false;
      }
    }
    return true;
  }, [currentlyDraggedBlockId, insertionLocation, program.layers]);

  return (
    <ResizingSvg
      svgRef={svgRef}
      onMouseDown={(e) => {
        onMouseDown(e);
      }}
      onMouseUp={() => {
        if (currentlyDraggedBlockId != null) {
          setProgram(
            produce((draft) => {
              moveBlockToNewLocationAsClusterRoot(
                draft,
                currentlyDraggedBlockId,
                insertionLocation
              );
            })
          );
        }
        setCurrentlyDraggedBlockId(null);
      }}
      onMouseMove={(e) => {
        onMouseMove(e);
      }}
    >
      {renderInsertionLocationPreview && (
        <InsertionLocationPreview
          insertionLocation={insertionLocation}
          program={program}
          blockLayouts={blockLayouts}
          layerIntervals={layerIntervals}
        />
      )}

      {clusterRootBlockIds
        .flatMap((clusterRootBlockId) =>
          getDescendantsTopologicallySorted(
            nestedDependencyGraph,
            clusterRootBlockId,
            true
          )
        )
        .map((blockId) => (
          <BlockInEditor
            key={blockId}
            block={program.blocks[blockId]}
            blockLayout={blockLayouts[blockId]}
            dragOffset={
              blocksNestedInDraggedBlock.has(blockId) ? dragOffset : null
            }
            onMouseDown={() => {
              setCurrentlyDraggedBlockId(blockId);
            }}
          />
        ))}

      {lineConnectionLayouts.map(
        ({ dependencyBlockId, dependentBlockId, endpoint }, index) => (
          <LineConnectionInEditor
            key={index}
            startPoint={blockLayouts[dependencyBlockId].output}
            endPoint={endpoint}
            dependencyBlockDragOffset={
              blocksNestedInDraggedBlock.has(dependencyBlockId)
                ? dragOffset
                : null
            }
            dependentBlockDragOffset={
              blocksNestedInDraggedBlock.has(dependentBlockId)
                ? dragOffset
                : null
            }
          />
        )
      )}
    </ResizingSvg>
  );
}
