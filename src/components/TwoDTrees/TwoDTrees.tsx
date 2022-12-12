import { useEffect, useState } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import generateRandomPoints from "../../lib/generator/randomPoints";
import { Point } from "../../lib/geometry";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const TwoDTrees = () => {
  const [points, setPoints] = useState<Point[]>([]);

  const handleAddPoint = (newPoint: Point) => {
    const fitleredPoints = points.filter((point) => {
      if (point.x == newPoint.x && point.y == newPoint.y) {
        return false;
      }
      return true;
    });
    const newPoints = [...fitleredPoints, newPoint];
    setPoints(newPoints);
  };

  const handleDeletePoint = (id: Point["id"]) => {
    const newPoints = points.filter((point) => point.id !== id);
    setPoints(newPoints);
  };

  const handleReset = () => {
    setPoints([]);
  };

  useEffect(() => {
    const twoDTree = new TwoDTree(points);
    console.log("WALK");
    // twoDTree.rootNode?.walk({ strategy: "breadth" }, (node) => {
    //   console.log(node);
    //   return true;
    // });
    // const nodes = twoDTree.rootNode?.all(() => true);
    // console.log(nodes);
    // const visited: Point["id"][] = [];
    // const dedupedNodes = nodes?.filter((node) => {
    //   if (visited.includes(node.model.id)) {
    //     return false;
    //   }
    //   visited.push(node.model.id);
    //   return true;
    // });
    // console.log({ dedupedNodes });
    const visitChildren = (node) => {
      if (!node || !node.model) {
        return;
      }
      console.log("visited", node.model.id);
      if (node.children) {
        node.children.forEach((childNode) => {
          visitChildren(childNode);
        });
      }
    };
    visitChildren(twoDTree.rootNode);
  }, [points]);

  return (
    <TwoDTreesCanvas
      points={points}
      vectors={[]}
      onAddPoint={handleAddPoint}
      onDeletePoint={handleDeletePoint}
    />
  );
};

export default TwoDTrees;
