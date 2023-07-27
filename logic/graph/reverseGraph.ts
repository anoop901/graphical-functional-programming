export default function reverseGraph(graph: { [nodeId: string]: string[] }) {
  const reversed: { [nodeId: string]: string[] } = {};
  for (const nodeId of Object.keys(graph)) {
    reversed[nodeId] = [];
  }
  for (const nodeId of Object.keys(graph)) {
    for (const dependencyId of graph[nodeId]) {
      if (dependencyId in reversed) {
        reversed[dependencyId].push(nodeId);
      }
    }
  }
  return reversed;
}
