import { ResetButton } from "../Button/ResetButton";
import NewtonCanvas from "./NewtonCanvas/NewtonCanvas";

export const Newton = () => {
  const handleReset = () => {
    console.log("reset");
  };

  return (
    <div>
      <div className="mb-8 flex w-full items-end justify-between">
        <p className="text-base font-medium text-gray-900">Newton Verfahren</p>
        <ResetButton onClick={handleReset} />
      </div>
      <NewtonCanvas mathFunction={(x) => Math.sin(x)}></NewtonCanvas>
    </div>
  );
};
