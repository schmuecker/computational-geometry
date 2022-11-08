import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ResetButtonProps {
  onClick: () => void;
}

function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full border border-transparent bg-slate-500 p-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={onClick}
    >
      <ArrowPathIcon className="h-6 w-6" />
    </button>
  );
}

export { ResetButton };
