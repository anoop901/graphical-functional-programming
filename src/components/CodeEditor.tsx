import * as React from "react";
import "./CodeEditor.css";
import ProgramLayout from "../ProgramLayout";
import Block from "../block/Block";

interface Props {
  programLayout: ProgramLayout;
}

export default class CodeEditor extends React.Component<Props> {
  render() {
    return (
      <svg className="CodeEditor">
        {this.props.programLayout.program.blocks
          .map((block, blockId) => {
            const blockPosition = this.props.programLayout.blockLocations.get(
              blockId
            );
            if (blockPosition === undefined) {
              throw new Error(
                `ProgramLayout had no position for block id ${blockId}`
              );
            }
            return (
              <g
                key={blockId}
                transform={`translate(${blockPosition.x} ${blockPosition.y})`}
              >
                {renderBlock(block)}
              </g>
            );
          })
          .toList()}
      </svg>
    );
  }
}

function renderBlock(block: Block): JSX.Element {
  const hue = block.numInputs > 0 && block.numOutputs > 0 ? 200 : 120;
  const strokeColor = `hsl(${hue},80%,30%)`;
  const fillColor = `hsl(${hue},80%,40%)`;

  const minimumTerminalSpacing = 50;
  const blockHeight = 40;
  const blockWidth =
    minimumTerminalSpacing * Math.max(block.numInputs, block.numOutputs);

  const topEdgePoints = Array().concat(
    { x: 0, y: 0 },
    ...Array.from({ length: block.numInputs }).map((_, i) => [
      { x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1) - 5, y: 0 },
      { x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1), y: 10 },
      { x: (blockWidth / (2 * block.numInputs)) * (2 * i + 1) + 5, y: 0 },
    ]),
    { x: blockWidth, y: 0 }
  );
  const bottomEdgePoints = Array().concat(
    { x: 0, y: blockHeight },
    ...Array.from({ length: block.numOutputs }).map((_, i) => [
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) - 5,
        y: blockHeight,
      },
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1),
        y: blockHeight + 10,
      },
      {
        x: (blockWidth / (2 * block.numOutputs)) * (2 * i + 1) + 5,
        y: blockHeight,
      },
    ]),
    { x: blockWidth, y: blockHeight }
  );

  const allPoints = [...topEdgePoints, ...[...bottomEdgePoints].reverse()];

  return (
    <g>
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={`M ${allPoints.map((p) => `${p.x},${p.y}`).join(" L ")} Z`}
      ></path>
    </g>
  );
}
