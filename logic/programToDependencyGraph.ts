import { getDependenciesOfBlock } from "@/model/Block";
import { Program } from "@/model/Program";

export default function programToDependencyGraph(program: Program): {
  [nodeId: string]: string[];
} {
  const graph: { [nodeId: string]: string[] } = {};
  for (const blockId of Object.keys(program.blocks)) {
    graph[blockId] = getDependenciesOfBlock(program.blocks[blockId]);
  }
  return graph;
}
