import * as React from "react";
import CodeEditor from "./CodeEditor";
import BlockBrowser from "./BlockBrowser";
import "./IndexPage.css";
import ProgramLayout from "../ProgramLayout";
import NumberLiteralBlock from "../block/literal/NumberLiteralBlock";
import DummyFunctionBlock from "../block/function/DummyFunctionBlock";
import { BlockId } from "../Program";

export default function IndexPage() {
  const programLayout = (() => {
    let newProgramLayout = ProgramLayout.create();
    let newBlockId: BlockId;

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new NumberLiteralBlock(1),
      {
        x: 10,
        y: 10,
      }
    ));

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new NumberLiteralBlock(2000),
      {
        x: 110,
        y: 10,
      }
    ));

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(3, 1),
      {
        x: 10,
        y: 70,
      }
    ));

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(2, 2),
      {
        x: 10,
        y: 130,
      }
    ));

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(2, 3),
      {
        x: 10,
        y: 190,
      }
    ));
    const blockId1 = newBlockId;

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(3, 2),
      {
        x: 10,
        y: 250,
      }
    ));
    const blockId2 = newBlockId;

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(10, 8),
      {
        x: 10,
        y: 310,
      }
    ));
    const blockId3 = newBlockId;

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(3, 9),
      {
        x: 10,
        y: 370,
      }
    ));

    ({ newBlockId, newProgramLayout } = newProgramLayout.addBlock(
      new DummyFunctionBlock(3, 6),
      {
        x: 10,
        y: 430,
      }
    ));

    newProgramLayout = newProgramLayout.removeBlock(blockId2);
    newProgramLayout = newProgramLayout.addConnection({
      sourceBlockId: blockId1,
      sourceBlockOutputIndex: 1,
      destinationBlockId: blockId3,
      destinationBlockInputIndex: 3,
    });

    return newProgramLayout;
  })();
  return (
    <div className="IndexPage">
      <BlockBrowser />
      <CodeEditor programLayout={programLayout} />
    </div>
  );
}
