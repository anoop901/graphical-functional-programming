import * as React from "react";
import CodeEditor from "./CodeEditor";
import "./IndexPage.css";
import ProgramLayout from "../ProgramLayout";
import NumberLiteralBlock from "../block/NumberLiteralBlock";
import { Map } from "immutable";
import AdditionBlock from "../block/function/AdditionBlock";
import MultiplicationBlock from "../block/function/MultiplicationBlock";
import NegationBlock from "../block/function/NegationBlock";
import NumberInputBlock from "../block/NumberInputBlock";

export default function IndexPage(): JSX.Element {
  const { programLayout: initProgramLayoutWithoutConnections, blockIds } = [
    {
      name: "literal 3",
      block: new NumberLiteralBlock(3),
      location: { x: 200, y: 100 },
    },
    {
      name: "literal 5",
      block: new NumberInputBlock(),
      location: { x: 100, y: 100 },
    },
    {
      name: "negation",
      block: new NegationBlock(),
      location: { x: 200, y: 200 },
    },
    {
      name: "addition",
      block: new AdditionBlock(),
      location: { x: 100, y: 300 },
    },
    {
      name: "literal 6",
      block: new NumberLiteralBlock(6),
      location: { x: 300, y: 200 },
    },
    {
      name: "multiplication",
      block: new MultiplicationBlock(),
      location: { x: 200, y: 400 },
    },
  ].reduce(
    ({ programLayout, blockIds }, { name, block, location }) => {
      const { newProgramLayout, newBlockId } = programLayout.addBlock(
        block,
        location
      );
      return {
        programLayout: newProgramLayout,
        blockIds: blockIds.set(name, newBlockId),
      };
    },
    {
      programLayout: ProgramLayout.create(),
      blockIds: Map<string, string>(),
    }
  );
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const initProgramLayout = initProgramLayoutWithoutConnections
    .addConnection({
      sourceBlockId: blockIds.get("literal 3")!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get("negation")!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get("literal 5")!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get("addition")!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get("addition")!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get("multiplication")!,
      destinationBlockInputIndex: 0,
    })
    .addConnection({
      sourceBlockId: blockIds.get("negation")!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get("addition")!,
      destinationBlockInputIndex: 1,
    })
    .addConnection({
      sourceBlockId: blockIds.get("literal 6")!,
      sourceBlockOutputIndex: 0,
      destinationBlockId: blockIds.get("multiplication")!,
      destinationBlockInputIndex: 1,
    });
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  const [programLayout, setProgramLayout] = React.useState(initProgramLayout);
  return (
    <div className="IndexPage">
      <CodeEditor
        programLayout={programLayout}
        setProgramLayout={setProgramLayout}
      />
    </div>
  );
}
