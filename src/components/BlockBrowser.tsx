import React = require("react");
import './BlockBrowser.css'

export default class BlockBrowser extends React.Component {
  render() {
    return <div className="BlockBrowser">
      {Array.from({length: 100}).map((_, i) => 
        <div>Block #{i}</div>
      )}
    </div>
  }
}