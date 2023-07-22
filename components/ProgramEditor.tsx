"use client";
import colors from "tailwindcss/colors";
import CenteredRect from "./CenteredRect";
import { useEffect, useRef, useState } from "react";

export default function ProgramEditor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (svgRef.current) {
      const observer = new ResizeObserver((e) => {
        const { inlineSize: width, blockSize: height } = e[0].contentBoxSize[0];
        setSize({ width, height });
      });
      observer.observe(svgRef.current);

      return () => observer.disconnect();
    }
  }, []);
  const center = { x: 0, y: 0 };

  return (
    <svg
      viewBox={`${-size.width / 2} ${-size.height / 2} ${size.width} ${
        size.height
      }`}
      ref={svgRef}
      className="h-full"
    >
      <CenteredRect
        x={center.x}
        y={center.y}
        width={100}
        height={25}
        rx={5}
        fill={colors.green[200]}
        stroke={colors.green[500]}
        strokeWidth={1}
      />
      <text
        x={center.x}
        y={center.y}
        fill={colors.green[800]}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {size.width}x{size.height}
      </text>
    </svg>
  );
}
