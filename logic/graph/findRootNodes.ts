export default function findRootNodes(graph: { [nodeId: string]: string[] }) {
  const nodeHasDependents: { [nodeId: string]: boolean } = {};
  for (const nodeId in graph) {
    for (const dependencyId of graph[nodeId]) {
      nodeHasDependents[dependencyId] = true;
    }
  }
  return Object.keys(graph).filter((nodeId) => !nodeHasDependents[nodeId]);
}
