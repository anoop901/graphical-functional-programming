import LiteralBlock from "./LiteralBlock";
import * as React from "react";

export default class NumberLiteralBlock extends LiteralBlock {
  constructor(
    public value: number,
  ) {
    super();
  }

  getSvg(): JSX.Element {
    const textColor = `#fff`;
    const strokeColor = `hsl(120,80%,30%)`;
    const fillColor = `hsl(120,80%,40%)`;

    const text = `${this.value}`;
    const textLength = text.length * 11;

    return <g>
      <path
        stroke={strokeColor}
        fill={fillColor}
        d={"M " + [
          {x: 0, y: 0},
          {x: 0, y: 40},
          {x: textLength / 2 + 5, y: 40},
          {x: textLength / 2 + 10, y: 50},
          {x: textLength / 2 + 15, y: 40},
          {x: textLength + 20, y: 40},
          {x: textLength + 20, y: 0},
        ].map(a => `${a.x},${a.y}`).join(" L ") + " z"}
      ></path>
      <text
        className="BlockText"
        textAnchor="middle"
        dominantBaseline="middle"
        x={textLength / 2 + 10}
        y="20"
      >{text}</text>
    </g>
  }
}