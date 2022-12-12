import { useEffect } from "react";
import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import generateRandomPoints from "../../lib/generator/randomPoints";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const randomPoints = generateRandomPoints(5);
console.log("Generated random points");
console.table([...randomPoints]);
const twoDTree = new TwoDTree(randomPoints);
console.log(twoDTree);

const TwoDTrees = () => {
  return <TwoDTreesCanvas />;
};

export default TwoDTrees;
