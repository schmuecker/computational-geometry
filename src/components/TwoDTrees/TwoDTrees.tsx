import { TwoDTree } from "../../lib/algorithms/two-d-tree/twoDTree";
import generateRandomPoints from "../../lib/generator/randomPoints";
import TwoDTreesCanvas from "./TwoDTreesCanvas/TwoDTreesCanvas";

const randomPoints = generateRandomPoints(3);

const TwoDTrees = () => {
  const twoDTree = new TwoDTree(randomPoints);
  console.log(twoDTree);
  return <TwoDTreesCanvas />;
};

export default TwoDTrees;
