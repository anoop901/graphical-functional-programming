type SVGPathPart = MoveSVGPathPart | LineSVGPathPart | CurveSVGPathPart;

interface MoveSVGPathPart {
  type: "move";
  to: {
    x: number;
    y: number;
  };
}

interface LineSVGPathPart {
  type: "line";
  to: {
    x: number;
    y: number;
  };
}

interface CurveSVGPathPart {
  type: "curve";
  anchor1: {
    x: number;
    y: number;
  };
  anchor2: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
}

export default function buildSvgPath(
  pathParts: SVGPathPart[],
  closePath = false
): string {
  return [
    ...pathParts.map((pathPart) => {
      if (pathPart.type === "move") {
        return `M${pathPart.to.x} ${pathPart.to.y}`;
      } else if (pathPart.type === "line") {
        return `L${pathPart.to.x} ${pathPart.to.y}`;
      } else if (pathPart.type === "curve") {
        return `C${pathPart.anchor1.x} ${pathPart.anchor1.y} ${pathPart.anchor2.x} ${pathPart.anchor2.y} ${pathPart.to.x} ${pathPart.to.y}`;
      }
      return "";
    }),
    ...(closePath ? ["Z"] : []),
  ].join(" ");
}
