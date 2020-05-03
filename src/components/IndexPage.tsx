import * as React from 'react';
import CodeEditor from './CodeEditor';
import BlockBrowser from './BlockBrowser';
import './IndexPage.css'
import Program from '../Program';
import NumberLiteralBlock from '../block/literal/NumberLiteralBlock';
import { List } from 'immutable';

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="IndexPage">
        <BlockBrowser />
        <CodeEditor program={new Program(List.of(
          new NumberLiteralBlock(2),
          new NumberLiteralBlock(3),
          new NumberLiteralBlock(5),
          new NumberLiteralBlock(7),
          new NumberLiteralBlock(9),
          new NumberLiteralBlock(20000000000000),
          new NumberLiteralBlock(3.1416),
        ))} />
      </div>
    );
  }
}