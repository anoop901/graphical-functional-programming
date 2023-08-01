import { getDependenciesOfBlock } from "@/model/Block";
import { Program } from "@/model/Program";

export default function programToNestedDependencyGraph(program: Program): {
  [nodeId: string]: string[];
} {
  const graph: { [nodeId: string]: string[] } = {};
  for (const blockId of Object.keys(program.blocks)) {
    graph[blockId] = getDependenciesOfBlock(program.blocks[blockId]).filter(
      (nestedBlockId) => program.blocks[nestedBlockId].nested
    );
  }
  return graph;
}
