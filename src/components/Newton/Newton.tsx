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

  let activeFunction: func;
  if (fnId === "1") {
    activeFunction = functions[0];
  }
  if (fnId === "2") {
    activeFunction = functions[1];
  }
  if (fnId === "3") {
    activeFunction = functions[2];
  }
  if (fnId === "4") {
    activeFunction = functions[3];
  } else {
    activeFunction = functions[0];
  }

  const handleFuncChanged = (id: Option["id"]) => {
    setFnId(id);
  };

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <RadioGroup
          title="Algorithm"
          subtitle="Choose the algorithm you prefer"
          options={functionOptions}
          checkedOption={fnId}
          onChange={handleFuncChanged}
        />
      </div>
      <NewtonCanvas
        mathFunction={(x) => activeFunction.fn(x)}
        derivitive={(x) => activeFunction.dfn(x)}
      ></NewtonCanvas>
    </div>
  );
};
