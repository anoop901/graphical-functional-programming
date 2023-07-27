export default function getDescendantsTopologicallySorted(
  graph: { [nodeId: string]: string[] },
  root: string,
  reverse = false
): string[] {
  const sorted: string[] = [];
  const visited: { [nodeId: string]: boolean } = {};
  const visit = (nodeId: string) => {
    if (visited[nodeId]) {
      return;
    }
    if (reverse) {
      sorted.push(nodeId);
    }
    visited[nodeId] = true;
    for (const childId of graph[nodeId]) {
      visit(childId);
    }
    if (!reverse) {
      sorted.push(nodeId);
    }
  };
  visit(root);
  return sorted;
}
