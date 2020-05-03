import * as React from 'react';
import CodeEditor from './CodeEditor';
import BlockBrowser from './BlockBrowser';
import './IndexPage.css'

export default class IndexPage extends React.Component {
  render() {
    return (
      <div className="IndexPage">
        <BlockBrowser />
        <CodeEditor />
      </div>
    );
  }
}