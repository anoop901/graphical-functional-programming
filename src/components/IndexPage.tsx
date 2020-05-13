import * as React from "react";
import CodeEditor from "./CodeEditor";
import BlockBrowser from "./BlockBrowser";
import "./IndexPage.css";
import ProgramLayout from "../ProgramLayout";
import NumberLiteralBlock from "../block/literal/NumberLiteralBlock";
import DummyFunctionBlock from "../block/function/DummyFunctionBlock";

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="IndexPage">
        <BlockBrowser />
        <CodeEditor
          programLayout={ProgramLayout.create()
            .addBlock(new NumberLiteralBlock(1), { x: 10, y: 10 })
            .addBlock(new NumberLiteralBlock(2000), { x: 110, y: 10 })
            .addBlock(new DummyFunctionBlock(3, 1), { x: 10, y: 70 })
            .addBlock(new DummyFunctionBlock(2, 2), { x: 10, y: 130 })
            .addBlock(new DummyFunctionBlock(2, 3), { x: 10, y: 190 })
            .addBlock(new DummyFunctionBlock(3, 2), { x: 10, y: 250 })
            .addBlock(new DummyFunctionBlock(10, 8), { x: 10, y: 310 })
            .addBlock(new DummyFunctionBlock(3, 9), { x: 10, y: 370 })
            .addBlock(new DummyFunctionBlock(3, 6), { x: 10, y: 430 })}
        />
      </div>
    );
  }
}
