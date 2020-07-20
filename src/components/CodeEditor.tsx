import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import BlockInEditor, {
  getBlockOutputLocation,
  getBlockInputLocation,
} from "./BlockInEditor";
import ConnectionInEditor from "./ConnectionInEditor";
import { BlockId } from "../Program";
import { set } from "immutable";
import Connection from "../Connection";
import { Menu, MenuItem } from "@material-ui/core";
import NumberLiteralBlock from "../block/NumberLiteralBlock";
import AdditionBlock from "../block/function/AdditionBlock";
import NegationBlock from "../block/function/NegationBlock";
import MultiplicationBlock from "../block/function/MultiplicationBlock";

interface DragState {
  blockId: string;
  offset: { x: number; y: number };
}

type AddingConnectionState =
  | IdleState
  | HoveringOutputState
  | DrawingNewConnectionState
  | SnappingNewConnectionState;

interface IdleState {
  state: "IdleState";
}

interface HoveringOutputState {
  state: "HoveringOutputState";
  blockId: BlockId;
  outputIndex: number;
}

interface DrawingNewConnectionState {
  state: "DrawingNewConnectionState";
  blockId: BlockId;
  outputIndex: number;
  mouseLocation: { x: number; y: number };
}

interface SnappingNewConnectionState {
  state: "SnappingNewConnectionState";
  newConnection: Connection;
}

interface MenuState {
  location: { x: number; y: number };
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
  const [addingConnectionState, setAddingConnectionState] = React.useState<
    AddingConnectionState
  >({ state: "IdleState" });
  const [menuState, setMenuState] = React.useState<MenuState | undefined>(
    undefined
  );

  function closeMenu() {
    setMenuState(undefined);
  }

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
        if (
          addingConnectionState.state === "DrawingNewConnectionState" &&
          svgRef.current !== null
        ) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
          setAddingConnectionState(
            set(addingConnectionState, "mouseLocation", mouseLocation)
          );
        }
      }}
      onMouseUp={() => {
        setDragState(undefined);
        if (
          addingConnectionState.state === "DrawingNewConnectionState" ||
          addingConnectionState.state === "SnappingNewConnectionState"
        ) {
          setAddingConnectionState({ state: "IdleState" });
          if (addingConnectionState.state === "SnappingNewConnectionState") {
            setProgramLayout(
              programLayout.addConnection(addingConnectionState.newConnection)
            );
          }
        }
      }}
      onMouseLeave={() => {
        setDragState(undefined);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (svgRef.current !== null) {
          setMenuState({
            location: {
              x: e.clientX - 2,
              y: e.clientY - 4,
            },
          });
        }
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
          ...Array.from({ length: block.numInputs }).map((_, inputIndex) => {
            const inputLocation = getBlockInputLocation(
              block,
              inputIndex,
              location
            );
            const visible =
              (addingConnectionState.state === "DrawingNewConnectionState" ||
                addingConnectionState.state === "SnappingNewConnectionState") &&
              programLayout.program.blockInputIsUnconnected(
                blockId,
                inputIndex
              );
            const emphasized =
              addingConnectionState.state === "SnappingNewConnectionState" &&
              addingConnectionState.newConnection.destinationBlockId ===
                blockId &&
              addingConnectionState.newConnection.destinationBlockInputIndex ===
                inputIndex;
            return (
              <circle
                onMouseEnter={() => {
                  if (
                    addingConnectionState.state ===
                      "DrawingNewConnectionState" &&
                    programLayout.program.blockInputIsUnconnected(
                      blockId,
                      inputIndex
                    )
                  ) {
                    setAddingConnectionState({
                      state: "SnappingNewConnectionState",
                      newConnection: {
                        sourceBlockId: addingConnectionState.blockId,
                        sourceBlockOutputIndex:
                          addingConnectionState.outputIndex,
                        destinationBlockId: blockId,
                        destinationBlockInputIndex: inputIndex,
                      },
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    addingConnectionState.state ===
                      "SnappingNewConnectionState" &&
                    svgRef.current !== null
                  ) {
                    setAddingConnectionState({
                      state: "DrawingNewConnectionState",
                      blockId:
                        addingConnectionState.newConnection.sourceBlockId,
                      outputIndex:
                        addingConnectionState.newConnection
                          .sourceBlockOutputIndex,
                      mouseLocation: mouseEventToSvgPoint(e, svgRef.current),
                    });
                  }
                }}
                key={`${blockId}.in.${inputIndex}`}
                cx={inputLocation.x}
                cy={inputLocation.y}
                r={visible ? 20 : 10}
                fill={visible ? (emphasized ? "#0006" : "#0003") : "#0000"}
              />
            );
          }),
          ...Array.from({ length: block.numOutputs }).map((_, outputIndex) => {
            const outputLocation = getBlockOutputLocation(
              block,
              outputIndex,
              location
            );
            const visible =
              addingConnectionState.state === "HoveringOutputState" &&
              addingConnectionState.blockId === blockId;
            return (
              <circle
                onMouseEnter={() => {
                  if (addingConnectionState.state === "IdleState") {
                    setAddingConnectionState({
                      state: "HoveringOutputState",
                      blockId,
                      outputIndex,
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (addingConnectionState.state === "HoveringOutputState") {
                    setAddingConnectionState({ state: "IdleState" });
                  }
                }}
                onMouseDown={(e) => {
                  if (addingConnectionState.state === "HoveringOutputState") {
                    if (svgRef.current !== null) {
                      const mouseLocation = mouseEventToSvgPoint(
                        e,
                        svgRef.current
                      );
                      setAddingConnectionState({
                        state: "DrawingNewConnectionState",
                        blockId,
                        outputIndex,
                        mouseLocation,
                      });
                    }
                  }
                }}
                key={`${blockId}.out.${outputIndex}`}
                cx={outputLocation.x}
                cy={outputLocation.y}
                r={visible ? 20 : 10}
                fill={visible ? "#0003" : "#0000"}
              />
            );
          }),
        ];
      })}
      {addingConnectionState.state === "DrawingNewConnectionState" ? (
        <ConnectionInEditor
          sourceOutputLocation={getBlockOutputLocation(
            programLayout.program.getBlock(addingConnectionState.blockId),
            addingConnectionState.outputIndex,
            programLayout.getBlockLocation(addingConnectionState.blockId)
          )}
          destInputLocation={addingConnectionState.mouseLocation}
          removeConnection={() => {
            // do nothing
          }}
          preview
        />
      ) : null}
      {addingConnectionState.state === "SnappingNewConnectionState" ? (
        <ConnectionInEditor
          sourceOutputLocation={getBlockOutputLocation(
            programLayout.program.getBlock(
              addingConnectionState.newConnection.sourceBlockId
            ),
            addingConnectionState.newConnection.sourceBlockOutputIndex,
            programLayout.getBlockLocation(
              addingConnectionState.newConnection.sourceBlockId
            )
          )}
          destInputLocation={getBlockInputLocation(
            programLayout.program.getBlock(
              addingConnectionState.newConnection.destinationBlockId
            ),
            addingConnectionState.newConnection.destinationBlockInputIndex,
            programLayout.getBlockLocation(
              addingConnectionState.newConnection.destinationBlockId
            )
          )}
          removeConnection={() => {
            // do nothing
          }}
          preview
        />
      ) : null}
      <Menu
        keepMounted
        open={menuState !== undefined}
        onClose={() => {
          closeMenu();
        }}
        anchorReference="anchorPosition"
        anchorPosition={
          menuState !== undefined
            ? {
                top: menuState.location.y,
                left: menuState.location.x,
              }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(
                  new NumberLiteralBlock(0),
                  menuState.location
                ).newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create number literal block
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(new AdditionBlock(), menuState.location)
                  .newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create addition function block
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(new NegationBlock(), menuState.location)
                  .newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create negation function block
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(
                  new MultiplicationBlock(),
                  menuState.location
                ).newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create multiplication block
        </MenuItem>
      </Menu>
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
