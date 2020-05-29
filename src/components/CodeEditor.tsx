import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import BlockInEditor, {
  getBlockOutputLocation,
  getBlockInputLocation,
} from "./BlockInEditor";
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
        if (dragState !== undefined && svgRef.current !== null) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
          setProgramLayout(
            programLayout.moveBlock(dragState.blockId, {
              x: mouseLocation.x - dragState.offset.x,
              y: mouseLocation.y - dragState.offset.y,
            })
          );
        }
      }}
      onMouseUp={() => {
        setDragState(undefined);
      }}
      onMouseLeave={() => {
        setDragState(undefined);
      }}
    >
      {programLayout.program.blocks
        .map((block, blockId) => {
          const blockLocation = programLayout.getBlockLocation(blockId);
          return (
            <BlockInEditor
              key={blockId}
              block={block}
              setBlock={(block) => {
                setProgramLayout(programLayout.setBlock(blockId, block));
              }}
              location={blockLocation}
              onMouseDown={(e) => {
                if (svgRef.current !== null) {
                  const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);

                  setDragState({
                    blockId,
                    offset: {
                      x: mouseLocation.x - blockLocation.x,
                      y: mouseLocation.y - blockLocation.y,
                    },
                  });
                }
              }}
            />
          );
        })
        .toList()}
      {programLayout.program.connections
        .map((connection, connectionId) => {
          const sourceBlock = programLayout.program.getBlock(
            connection.sourceBlockId
          );
          const destBlock = programLayout.program.getBlock(
            connection.destinationBlockId
          );
          const sourceBlockLocation = programLayout.getBlockLocation(
            connection.sourceBlockId
          );
          const destBlockLocation = programLayout.getBlockLocation(
            connection.destinationBlockId
          );
          return (
            <ConnectionInEditor
              key={connectionId}
              sourceOutputLocation={getBlockOutputLocation(
                sourceBlock,
                connection.sourceBlockOutputIndex,
                sourceBlockLocation
              )}
              destInputLocation={getBlockInputLocation(
                destBlock,
                connection.destinationBlockInputIndex,
                destBlockLocation
              )}
              removeConnection={() => {
                setProgramLayout(programLayout.removeConnection(connectionId));
              }}
            ></ConnectionInEditor>
          );
        })
        .toList()}
      {programLayout.program.blocks.entrySeq().flatMap(([blockId, block]) => {
        const location = programLayout.getBlockLocation(blockId);
        return [
          ...Array.from({ length: block.numInputs }).map((_, i) => {
            const inputLocation = getBlockInputLocation(block, i, location);
            return (
              <circle
                key={`${blockId}.in.${i}`}
                cx={inputLocation.x}
                cy={inputLocation.y}
                r={10}
                fill="#0000"
              />
            );
          }),
          ...Array.from({ length: block.numOutputs }).map((_, i) => {
            const outputLocation = getBlockOutputLocation(block, i, location);
            return (
              <circle
                key={`${blockId}.out.${i}`}
                cx={outputLocation.x}
                cy={outputLocation.y}
                r={10}
                fill="#0000"
              />
            );
          }),
        ];
      })}
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
  const screenCTM = svgElem.getScreenCTM();
  if (screenCTM === null) {
    throw new Error("getScreenCTM() returned null");
  }
  const svgPoint = eventPoint.matrixTransform(screenCTM.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
}
