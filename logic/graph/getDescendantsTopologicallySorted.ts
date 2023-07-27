export default function getDescendantsTopologicallySorted(
  graph: { [nodeId: string]: string[] },
  root: string
) {
  const sorted: string[] = [];
  const visited: { [nodeId: string]: boolean } = {};
  const visit = (nodeId: string) => {
    if (visited[nodeId]) {
      return;
    }
    visited[nodeId] = true;
    for (const childId of graph[nodeId]) {
      visit(childId);
    }
    sorted.push(nodeId);
  };
  visit(root);
  return sorted;
}
