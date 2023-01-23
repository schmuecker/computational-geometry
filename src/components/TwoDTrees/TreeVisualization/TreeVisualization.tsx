import { IKnot } from "../../../lib/algorithms/two-d-tree/twoDTree";
import { Point } from "../../../lib/geometry";

type TreeVisualizationProps = {
  rootNode: IKnot | undefined;
  onHoverPoint: (point?: Point) => void;
  markedPoint?: Point;
  searchResult?: { output: IKnot[]; visited: IKnot[] };
};

type Leaf = {
  x: number;
  y: number;
  node: IKnot;
};

const useDrawTree = (rootNode: IKnot) => {
  // const [vectors, setVectors] = useState<Vector[]>([]);
  let leafs: Leaf[] = [];
  if (!rootNode) {
    return;
  }
  const drawTree = (node: IKnot, layer = 0, x = 200) => {
    const y = layer * 50;
    leafs = [...leafs, { x, y, node }];
    if (node.children) {
      node.children.forEach((childNode: IKnot) => {
        const offset = 100 / Math.pow(2, layer);
        const xChild = childNode.location === "left" ? x - offset : x + offset;
        drawTree(childNode, layer + 1, xChild);
      });
    }
  };
  drawTree(rootNode);
  return leafs;
};

const getLeafColor = (
  leaf: Leaf,
  markedPoint?: Point,
  searchResult?: { output: IKnot[]; visited: IKnot[] }
) => {
  let color = "bg-slate-400";
  const leafId = leaf.node.model.id;
  let visited: IKnot[] = [];
  let output: IKnot[] = [];

  if (markedPoint && leafId === markedPoint.id) {
    color = "bg-yellow-300";
  }

  if (!searchResult) {
    return color;
  }

  if (searchResult.visited[0]) {
    visited = searchResult.visited.filter((knot: IKnot) => {
      return knot.model.id === leafId;
    });
    if (visited[0]) {
      return (color = "bg-red-400");
    }
  }

  if (searchResult.output[0]) {
    output = searchResult.output.filter((knot: IKnot) => {
      return knot.model.id === leafId;
    });
    if (output[0]) {
      return (color = "bg-yellow-300");
    }
  }

  return color;
};

const TreeVisualization = ({
  rootNode,
  onHoverPoint,
  markedPoint,
  searchResult,
}: TreeVisualizationProps) => {
  if (!rootNode) {
    return null;
  }
  const leafs = useDrawTree(rootNode);
  return (
    <div className="relative h-full">
      {leafs?.map((leaf) => {
        return (
          <div
            key={leaf.node.model.id}
            className={`group absolute h-4 w-4 rounded-full ${getLeafColor(
              leaf,
              markedPoint,
              searchResult
            )} `}
            style={{ top: leaf.y, left: leaf.x }}
            onMouseOver={() => {
              onHoverPoint(leaf.node.model);
            }}
            onMouseOut={() => {
              onHoverPoint();
            }}
          >
            <div className="absolute z-10 ml-6 hidden whitespace-nowrap rounded-md bg-black/40 px-3 py-2 text-white backdrop-blur-sm group-hover:block">
              <p>
                (
                {`${Number(leaf.node.model.x).toFixed(0)}, ${Number(
                  leaf.node.model.y
                ).toFixed(0)}`}
                )
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TreeVisualization;
