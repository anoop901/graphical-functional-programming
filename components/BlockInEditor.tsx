import Block from "@/model/Block";
import BlockLayout from "@/model/BlockLayout";
import { motion } from "framer-motion";
import colors from "tailwindcss/colors";

interface BlockInEditorProps {
  // The block to render.
  block: Block;
  // The layout of the block.
  blockLayout: BlockLayout;
  // If the block (or a block in which it is nested) is being dragged, the
  // offset to render the block away from its position in the layout. Otherwise,
  // null.
  dragOffset: { x: number; y: number } | null;
  // Callback invoked when the user presses the mouse down on the block.
  onMouseDown?: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}

export default function BlockInEditor({
  block,
  blockLayout,
  dragOffset,
  onMouseDown,
}: BlockInEditorProps) {
  const { topLeft, size } = blockLayout;
  const isDraggingThisBlock = dragOffset != null;
  return (
    <motion.g
      animate={{
        x: topLeft.x + (isDraggingThisBlock ? dragOffset.x : 0),
        y: topLeft.y + (isDraggingThisBlock ? dragOffset.y : 0),
        opacity: isDraggingThisBlock ? 0.5 : 1,
      }}
      transition={{
        ...(isDraggingThisBlock
          ? { x: { duration: 0 }, y: { duration: 0 } }
          : { x: { type: "tween" }, y: { type: "tween" } }),
      }}
      initial={false}
      onMouseDown={onMouseDown}
    >
      <rect
        width={size.width}
        height={size.height}
        rx={10}
        fill={colors.green[100]}
        stroke={colors.green[500]}
        strokeWidth={2}
      />
      <text
        x={size.width / 2}
        y={size.height / 2}
        fill={colors.green[700]}
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {block.type === "IntegerLiteralBlock" ? block.value : null}
        {block.type === "ReferenceBlock" ? block.name : null}
      </text>
    </motion.g>
  );
}
