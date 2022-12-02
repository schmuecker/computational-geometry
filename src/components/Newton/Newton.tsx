import { ResetButton } from "../Button/ResetButton";
import NewtonCanvas from "./NewtonCanvas/NewtonCanvas";

export const Newton = () => {
  const handleReset = () => {
    console.log("reset");
  };

  const functions = [
    {
      label: "x^2",
      fn: (x: number) => x ** 2,
      dfn: (x: number) => 2 * x,
    },
    {
      label: "(1/2) * x^2",
      fn: (x: number) => (1 / 2) * x ** 2,
      dfn: (x: number) => x,
    },
  ];

  const activeFunction = functions[1];

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <p className="text-base font-medium text-gray-900">Newton Verfahren</p>
        <ResetButton onClick={handleReset} />
      </div>
      <NewtonCanvas
        mathFunction={(x) => activeFunction.fn(x)}
        derivitive={(x) => activeFunction.dfn(x)}
      ></NewtonCanvas>
    </div>
  );
};
