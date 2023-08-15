import { useEffect, useState } from "react";

/**
 * Returns information about the current state of the mouse in SVG coordinates.
 * @param svgRef A ref to the SVG element.
 * @returns An object containing the following properties:
 * - `mousePosition`: The current position of the mouse, in SVG coordinates.
 * - `lastMouseDown`: The position of the mouse when the user last pressed the
 *   mouse button, in SVG coordinates.
 * - `dragOffset`: The total displacement of the mouse during the current drag.
 * - `onMouseMove`: A callback that should be called when a mousemove event
 *   occurs on the SVG element.
 * - `onMouseDown`: A callback that should be called when a mousedown event
 *   occurs on the SVG element.
 */
export default function useMouse(svgRef: React.RefObject<SVGSVGElement>) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [lastMouseDown, setLastMouseDown] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const dragOffset = {
    x: mousePosition.x - lastMouseDown.x,
    y: mousePosition.y - lastMouseDown.y,
  };

  return {
    mousePosition,
    lastMouseDown,
    dragOffset,
    onMouseMove: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const svg = svgRef.current;
      if (svg != null) {
        const clientPoint = new DOMPoint(e.clientX, e.clientY);
        const screenCTM = svg.getScreenCTM();
        if (screenCTM != null) {
          // TODO: Find a way to cache this inverse matrix so we don't have to
          // recalculate it on every mousemove event.
          const svgPoint = clientPoint.matrixTransform(screenCTM.inverse());
          setMousePosition({
            x: svgPoint.x,
            y: svgPoint.y,
          });
        }
      }
    },
    onMouseDown: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      setLastMouseDown(mousePosition);
    },
  };
}
