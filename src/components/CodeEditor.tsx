import * as React from 'react'
import './CodeEditor.css'
import Program from '../Program'

interface Props {
  program: Program;
}

export default class CodeEditor extends React.Component<Props> {
  render() {
    return <svg className="CodeEditor">
      {this.props.program.blocks.map((block, i) =>
        <g key={i} transform={`translate(10 ${60 * i + 10})`}>{block.getSvg()}</g>
      )}
    </svg>
  }
}