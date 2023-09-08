import { motion } from "framer-motion";
import colors from "tailwindcss/colors";

export interface LineConnectionInEditorProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  dependencyBlockDragOffset: { x: number; y: number } | null;
  dependentBlockDragOffset: { x: number; y: number } | null;
}

function adjustPointByOffset(
  point: { x: number; y: number },
  offset: { x: number; y: number }
): { x: number; y: number } {
  return { x: point.x + offset.x, y: point.y + offset.y };
}

function adjustPointByOptionalOffset(
  point: { x: number; y: number },
  offset: { x: number; y: number } | null
): { x: number; y: number } {
  if (offset == null) {
    return point;
  } else {
    return adjustPointByOffset(point, offset);
  }
}

export default function LineConnectionInEditor({
  startPoint,
  endPoint,
  dependencyBlockDragOffset,
  dependentBlockDragOffset,
}: LineConnectionInEditorProps) {
  const isDraggingDependencyBlock = dependencyBlockDragOffset != null;
  const isDraggingDependentBlock = dependentBlockDragOffset != null;

  // Since the user might be dragging one of the blocks connected by
  // this line, we may need to adjust the line's start and end points.
  // We do this by adding the drag offset to the start and end points
  // if the corresponding block is being dragged.
  const draggedStartPoint = adjustPointByOptionalOffset(
    startPoint,
    dependencyBlockDragOffset
  );
  const draggedEndPoint = adjustPointByOptionalOffset(
    endPoint,
    dependentBlockDragOffset
  );

  return (
    <motion.g
      animate={{
        opacity:
          isDraggingDependencyBlock || isDraggingDependentBlock ? 0.25 : 1,
      }}
    >
      <motion.line
        animate={{
          x1: draggedStartPoint.x,
          y1: draggedStartPoint.y,
          x2: draggedEndPoint.x,
          y2: draggedEndPoint.y,
        }}
        transition={{
          ...(isDraggingDependencyBlock
            ? { x1: { duration: 0 }, y1: { duration: 0 } }
            : { x1: "easeOut", y1: "easeOut" }),
          ...(isDraggingDependentBlock
            ? { x2: { duration: 0 }, y2: { duration: 0 } }
            : { x2: "easeOut", y2: "easeOut" }),
        }}
        stroke={colors.black}
        strokeWidth={2}
      />
      <motion.circle
        animate={{
          cx: draggedEndPoint.x,
          cy: draggedEndPoint.y,
        }}
        transition={{
          ...(isDraggingDependentBlock
            ? { cx: { duration: 0 }, cy: { duration: 0 } }
            : { cx: "easeOut", cy: "easeOut" }),
        }}
        r={5}
        fill={colors.black}
      />
    </motion.g>
  );
}
