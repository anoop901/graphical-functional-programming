import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import Block from "../block/Block";
import BlockInEditor from "./BlockInEditor";
import ConnectionInEditor from "./ConnectionInEditor";

interface DragState {
  blockId: string;
  offset: { x: number; y: number };
}

export default function CodeEditor({
  programLayout,
  setProgramLayout,
}: {
  programLayout: ProgramLayout;
  setProgramLayout: (programLayout: ProgramLayout) => void;
}): JSX.Element {
  const [dragState, setDragState] = React.useState<DragState | undefined>(
    undefined
  );
  const svgRef = React.useRef<SVGSVGElement>(null);
  return (
    <svg
      ref={svgRef}
      className="CodeEditor"
      onMouseMove={(e) => {
        if (dragState !== undefined) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current!);
          setProgramLayout(
            programLayout.moveBlock(dragState.blockId, {
              x: mouseLocation.x - dragState.offset.x,
              y: mouseLocation.y - dragState.offset.y,
            })
          );
        }
      }}
      onMouseUp={(e) => {
        setDragState(undefined);
      }}
      onMouseLeave={(e) => {
        setDragState(undefined);
      }}
    >
      {programLayout.program.blocks
        .map((block, blockId) => {
          const blockPosition = programLayout.blockLocations.get(blockId)!;
          return (
            <g
              key={blockId}
              transform={`translate(${blockPosition.x} ${blockPosition.y})`}
            >
              <BlockInEditor
                block={block}
                onMouseDown={(e) => {
                  const mouseLocation = mouseEventToSvgPoint(
                    e,
                    svgRef.current!
                  );

                  setDragState({
                    blockId,
                    offset: {
                      x: mouseLocation.x - blockPosition.x,
                      y: mouseLocation.y - blockPosition.y,
                    },
                  });
                }}
              />
            </g>
          );
        })
        .toList()}
      {programLayout.program.connections
        .map((connection, connectionId) => (
          <ConnectionInEditor
            connectionId={connectionId}
            programLayout={programLayout}
          ></ConnectionInEditor>
        ))
        .toList()}
    </svg>
  );
}

/**
 * Returns the coordinates where the MouseEvent `event` occurred relative to the
 * coordinate system of `svgElem`.
 */
function mouseEventToSvgPoint(
  event: React.MouseEvent,
  svgElem: SVGSVGElement
): { x: number; y: number } {
  const eventPoint = svgElem.createSVGPoint();
  eventPoint.x = event.clientX;
  eventPoint.y = event.clientY;
  const svgPoint = eventPoint.matrixTransform(
    svgElem.getScreenCTM()!.inverse()
  );
  return { x: svgPoint.x, y: svgPoint.y };
}
