export default function findClusterRoots(graph: {
  [nodeId: string]: string[];
}): string[] {
  const allNodeIds = Object.keys(graph);
  const nodesWithParents = new Set<string>();
  for (const nodeId of allNodeIds) {
    for (const childId of graph[nodeId]) {
      nodesWithParents.add(childId);
    }
  }
  return Object.keys(graph).filter((nodeId) => !nodesWithParents.has(nodeId));
}
