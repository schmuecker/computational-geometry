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
  const drawTree = (node, layer = 0, x = 200) => {
    const y = layer * 50;
    leafs = [...leafs, { x, y, node }];
    if (node.children) {
      node.children.forEach((childNode, index) => {
        const offset = 100 / Math.pow(2, layer);
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
            className="group absolute h-4 w-4 rounded-full bg-slate-400"
            style={{ top: leaf.y, left: leaf.x }}
          >
            <div className="ml-6 hidden bg-white group-hover:block">
              <p>id:{leaf.node.model.id.substr(0, 4)}</p>
              <p>x:{Number(leaf.node.model.x).toFixed(1)}</p>
              <p>y:{Number(leaf.node.model.y).toFixed(1)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TreeVisualization;