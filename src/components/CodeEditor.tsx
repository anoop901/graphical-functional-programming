import React = require("react");
import './CodeEditor.css'

export default class CodeEditor extends React.Component {
  render() {
    return <div className="CodeEditor">
      {Array.from({length: 200}).map((_, i) =>
        <div>Code #{i}</div>
      )}
    </div>
  }
}