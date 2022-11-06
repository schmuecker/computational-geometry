import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ResetButtonProps {
  onClick: () => void;
}

function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={onClick}
    >
      <ArrowPathIcon className="h-6 w-6" />
    </button>
  );
}

export { ResetButton };
