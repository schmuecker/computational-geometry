import { useState } from "react";
import { Option, RadioGroup } from "../RadioGroup/RadioGroup";
import NewtonCanvas from "./NewtonCanvas/NewtonCanvas";

interface func {
  id: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
}

const functions: func[] = [
  {
    id: "1",
    fn: (x: number) => x ** 2,
    dfn: (x: number) => 2 * x,
  },
  {
    id: "2",
    fn: (x: number) => (1 / 2) * x ** 2,
    dfn: (x: number) => x,
  },
  {
    id: "3",
    fn: (x: number) => (x + 3) ** 3,
    dfn: (x: number) => 3 * (x + 3) ** 2,
  },
  {
    id: "4",
    fn: (x: number) => x ** 3 - 6 * x ** 2 + 4 * x + 12,
    dfn: (x: number) => 3 * x ** 2 - 12 * x + 4,
  },
];

const functionOptions: Option[] = [
  { id: "1", label: "x²" },
  { id: "2", label: "(1/2) * x²" },
  { id: "3", label: "(x+3)³" },
  { id: "4", label: "x^3 - 6x^2 + 4x + 12" },
];

export const Newton = () => {
  const [fnId, setFnId] = useState<Option["id"]>(() => functionOptions[0].id);
  const [accuracy, setAccuracy] = useState<number>(0.01);

  let activeFunction: func;
  if (fnId) {
    activeFunction = functions[parseInt(fnId) - 1];
  } else {
    activeFunction = functions[0];
  }

  const handleFuncChanged = (id: Option["id"]) => {
    setFnId(id);
  };

  const handleAccuracyChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setAccuracy(value);
  };
  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <RadioGroup
          title="Functions"
          subtitle="Choose a function"
          options={functionOptions}
          checkedOption={fnId}
          onChange={handleFuncChanged}
        />
      </div>
      <input
        type="number"
        step="0.01"
        id="accuracy"
        value={accuracy}
        onChange={(e) => handleAccuracyChange(e.target.valueAsNumber)}
      ></input>
      <NewtonCanvas
        mathFunction={(x) => activeFunction.fn(x)}
        derivitive={(x) => activeFunction.dfn(x)}
        accuracy={accuracy}
      ></NewtonCanvas>
    </div>
  );
};
