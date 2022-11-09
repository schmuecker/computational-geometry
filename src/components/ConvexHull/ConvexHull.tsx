import React, { useState } from "react";

import { Point, Vector } from "../../lib/geometry";
import { grahamScan, jarvisMarch, monotoneChain } from "../../lib/algorithms";
import { RadioGroup, Option } from "../RadioGroup/RadioGroup";
import { ResetButton } from "../Button/ResetButton";
import Canvas from "./Canvas/Canvas";

const algorithms: Option[] = [
  { id: "graham", label: "Graham Scan" },
  { id: "monotoneChain", label: "Monotone Chain" },
  { id: "jarvis", label: "Jarvis March" },
];

function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [algo, setAlgo] = useState<Option["id"]>(() => algorithms[0].id);

  let vectors: Vector[] = [];
  if (algo === "graham") {
    vectors = grahamScan(points);
  }
  if (algo === "jarvis") {
    vectors = jarvisMarch(points);
  }
  if (algo === "monotoneChain") {
    vectors = monotoneChain(points);
  }

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

  const handleAlgoChange = (id: Option["id"]) => {
    setAlgo(id);
  };

  const handleReset = () => {
    setPoints([]);
  };

  // Todo. set origin of coordinate system to bottom left
  return (
    <div>
      <div className="my-8 flex w-full justify-between items-end">
        <RadioGroup
          title="Algorithm"
          subtitle="Choose the algorithm you prefer"
          options={algorithms}
          checkedOption={algo}
          onChange={handleAlgoChange}
        />
        <div>
          <ResetButton onClick={handleReset} />
        </div>
      </div>
      <Canvas
        points={points}
        vectors={vectors}
        onAddPoint={handleAddPoint}
        onDeletePoint={handleDeletePoint}
      />
    </div>
  );
}

export default ConvexHull;
