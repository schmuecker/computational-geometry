import { useEffect, useState } from "react";
import { IKnot } from "../../../lib/algorithms/two-d-tree/twoDTree";

type TreeVisualizationProps = {
  rootNode: IKnot | undefined;
};

const useDrawTree = (rootNode) => {
  // const [vectors, setVectors] = useState<Vector[]>([]);
  let leafs = [];
  if (!rootNode) {
    return;
  }
  const drawTree = (node, layer = 0, x = 100) => {
    const y = layer * 50;
    leafs = [...leafs, { x, y, node }];
    if (node.children) {
      node.children.forEach((childNode, index) => {
        const offset = x / 2;
        const xChild = index === 0 ? x - offset : x + offset;
        drawTree(childNode, layer + 1, xChild);
      });
    }
  };
  drawTree(rootNode);
  return leafs;
};

const TreeVisualization = ({ rootNode }: TreeVisualizationProps) => {
  const leafs = useDrawTree(rootNode);
  return (
    <div className="relative h-full">
      {leafs?.map((leaf) => {
        return (
          <div
            key={leaf.node.model.id}
            className="absolute h-4 w-4 rounded-full bg-indigo-800"
            style={{ top: leaf.y, left: leaf.x }}
          ></div>
        );
      })}
    </div>
  );
};

export default TreeVisualization;
