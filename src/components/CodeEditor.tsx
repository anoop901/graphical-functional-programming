import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import BlockInEditor, {
  getBlockOutputLocation,
  getBlockInputLocation,
} from "./BlockInEditor";
import ConnectionInEditor from "./ConnectionInEditor";
import { BlockId } from "../Program";
import { Map, set, setIn } from "immutable";
import Connection from "../Connection";
import { Menu, MenuItem } from "@material-ui/core";
import NumberLiteralBlock from "../block/NumberLiteralBlock";
import AdditionBlock from "../block/function/AdditionBlock";
import NegationBlock from "../block/function/NegationBlock";
import MultiplicationBlock from "../block/function/MultiplicationBlock";
import NumberInputBlock from "../block/NumberInputBlock";
import NumberOutputBlock from "../block/NumberOutputBlock";

type EditorState =
  | IdleState
  | DragState
  | DrawingNewConnectionState
  | SnappingNewConnectionState;

interface IdleState {
  state: "IdleState";
}

interface DragState {
  state: "DragState";
  blockId: BlockId;
  offset: { x: number; y: number };
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
  const [editorState, setEditorState] = React.useState<EditorState>({
    state: "IdleState",
  });
  const [hoveredBlockOutput, setHoveredBlockOutput] = React.useState<{
    blockId: BlockId;
    outputIndex: number;
  } | null>(null);
  const [menuState, setMenuState] = React.useState<MenuState | undefined>(
    undefined
  );

  // Any input value that's not present in the map has a value of 0.
  const [inputValues, setInputValues] = React.useState<Map<BlockId, number>>(
    Map()
  );

  // Null indicates an error in evaluating the output. Any output value that's
  // not present in the map has a value of null.
  const [outputValues, setOutputValues] = React.useState<
    Map<BlockId, number | null>
  >(Map());

  React.useEffect(() => {
    const newOutputValues = programLayout.program.evaluate(inputValues);
    setOutputValues(newOutputValues);
  }, [programLayout.program, inputValues]);

  function closeMenu() {
    setMenuState(undefined);
  }

  const handleCodeEditorMouseMove = (mouseLocation: {
    x: number;
    y: number;
  }) => {
    if (editorState.state === "DragState") {
      setProgramLayout(
        programLayout.moveBlock(editorState.blockId, {
          x: mouseLocation.x - editorState.offset.x,
          y: mouseLocation.y - editorState.offset.y,
        })
      );
    }
    if (editorState.state === "DrawingNewConnectionState") {
      setEditorState(set(editorState, "mouseLocation", mouseLocation));
    }
  };

  const handleCodeEditorMouseUp = () => {
    setEditorState({ state: "IdleState" });
    if (editorState.state === "SnappingNewConnectionState") {
      setProgramLayout(programLayout.addConnection(editorState.newConnection));
    }
  };

  const handleCodeEditorMouseLeave = () => {
    setEditorState({ state: "IdleState" });
  };

  const handleCodeEditorContextMenu = (mouseLocation: {
    x: number;
    y: number;
  }) => {
    // TODO: only do this in IdleState
    if (editorState.state === "IdleState") {
      setMenuState({
        location: {
          x: mouseLocation.x - 2,
          y: mouseLocation.y - 4,
        },
      });
    }
  };

  const handleBlockInEditorMouseDown = (
    blockId: BlockId,
    blockLocation: { x: number; y: number },
    mouseLocation: { x: number; y: number }
  ) => {
    setEditorState({
      state: "DragState",
      blockId,
      offset: {
        x: mouseLocation.x - blockLocation.x,
        y: mouseLocation.y - blockLocation.y,
      },
    });
  };

  const handleBlockInputMouseEnter = (blockId: BlockId, inputIndex: number) => {
    if (
      editorState.state === "DrawingNewConnectionState" &&
      programLayout.program.blockInputIsUnconnected(blockId, inputIndex)
    ) {
      setEditorState({
        state: "SnappingNewConnectionState",
        newConnection: {
          sourceBlockId: editorState.blockId,
          sourceBlockOutputIndex: editorState.outputIndex,
          destinationBlockId: blockId,
          destinationBlockInputIndex: inputIndex,
        },
      });
    }
  };
  const handleBlockInputMouseLeave = (mouseLocation: {
    x: number;
    y: number;
  }) => {
    if (editorState.state === "SnappingNewConnectionState") {
      setEditorState({
        state: "DrawingNewConnectionState",
        blockId: editorState.newConnection.sourceBlockId,
        outputIndex: editorState.newConnection.sourceBlockOutputIndex,
        mouseLocation,
      });
    }
  };

  const handleBlockOutputMouseDown = (
    mouseLocation: {
      x: number;
      y: number;
    },
    blockId: BlockId,
    outputIndex: number
  ) => {
    if (editorState.state === "IdleState") {
      setEditorState({
        state: "DrawingNewConnectionState",
        blockId,
        outputIndex,
        mouseLocation,
      });
    }
  };

  const svgRef = React.useRef<SVGSVGElement>(null);
  return (
    <svg
      ref={svgRef}
      className="CodeEditor"
      onMouseMove={(e) => {
        if (svgRef.current !== null) {
          const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
          handleCodeEditorMouseMove(mouseLocation);
        }
      }}
      onMouseUp={() => {
        handleCodeEditorMouseUp();
      }}
      onMouseLeave={() => {
        handleCodeEditorMouseLeave();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleCodeEditorContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {programLayout.program.blocks
        .map((block, blockId) => {
          const blockLocation = programLayout.getBlockLocation(blockId);
          return (
            <BlockInEditor
              key={blockId}
              block={block}
              inputValue={inputValues.get(blockId, 0)}
              setInputValue={(value: number) =>
                setInputValues(setIn(inputValues, [blockId], value))
              }
              outputValue={outputValues.get(blockId, null)}
              setBlock={(block) => {
                setProgramLayout(programLayout.setBlock(blockId, block));
              }}
              location={blockLocation}
              onMouseDown={(e) => {
                if (svgRef.current !== null) {
                  const mouseLocation = mouseEventToSvgPoint(e, svgRef.current);
                  handleBlockInEditorMouseDown(
                    blockId,
                    blockLocation,
                    mouseLocation
                  );
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
              (editorState.state === "DrawingNewConnectionState" ||
                editorState.state === "SnappingNewConnectionState") &&
              programLayout.program.blockInputIsUnconnected(
                blockId,
                inputIndex
              );
            const emphasized =
              editorState.state === "SnappingNewConnectionState" &&
              editorState.newConnection.destinationBlockId === blockId &&
              editorState.newConnection.destinationBlockInputIndex ===
                inputIndex;
            return (
              <circle
                onMouseEnter={() => {
                  handleBlockInputMouseEnter(blockId, inputIndex);
                }}
                onMouseLeave={(e) => {
                  if (svgRef.current !== null) {
                    const mouseLocation = mouseEventToSvgPoint(
                      e,
                      svgRef.current
                    );
                    handleBlockInputMouseLeave(mouseLocation);
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
              editorState.state === "IdleState" &&
              hoveredBlockOutput !== null &&
              hoveredBlockOutput.blockId === blockId &&
              hoveredBlockOutput.outputIndex === outputIndex;
            return (
              <circle
                onMouseEnter={() => {
                  setHoveredBlockOutput({ blockId, outputIndex });
                }}
                onMouseLeave={() => {
                  setHoveredBlockOutput(null);
                }}
                onMouseDown={(e) => {
                  if (svgRef.current !== null) {
                    const mouseLocation = mouseEventToSvgPoint(
                      e,
                      svgRef.current
                    );
                    handleBlockOutputMouseDown(
                      mouseLocation,
                      blockId,
                      outputIndex
                    );
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
      {editorState.state === "DrawingNewConnectionState" ? (
        <ConnectionInEditor
          sourceOutputLocation={getBlockOutputLocation(
            programLayout.program.getBlock(editorState.blockId),
            editorState.outputIndex,
            programLayout.getBlockLocation(editorState.blockId)
          )}
          destInputLocation={editorState.mouseLocation}
          removeConnection={() => {
            // do nothing
          }}
          preview
        />
      ) : null}
      {editorState.state === "SnappingNewConnectionState" ? (
        <ConnectionInEditor
          sourceOutputLocation={getBlockOutputLocation(
            programLayout.program.getBlock(
              editorState.newConnection.sourceBlockId
            ),
            editorState.newConnection.sourceBlockOutputIndex,
            programLayout.getBlockLocation(
              editorState.newConnection.sourceBlockId
            )
          )}
          destInputLocation={getBlockInputLocation(
            programLayout.program.getBlock(
              editorState.newConnection.destinationBlockId
            ),
            editorState.newConnection.destinationBlockInputIndex,
            programLayout.getBlockLocation(
              editorState.newConnection.destinationBlockId
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
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(
                  new NumberInputBlock(),
                  menuState.location
                ).newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create number input block
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuState) {
              setProgramLayout(
                programLayout.addBlock(
                  new NumberOutputBlock(),
                  menuState.location
                ).newProgramLayout
              );
            }
            closeMenu();
          }}
        >
          Create number output block
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
