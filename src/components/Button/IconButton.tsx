import React from "react";

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
}

function IconButton({ onClick, icon }: IconButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-full border border-transparent bg-ebony-600 p-2 text-white shadow-sm transition hover:bg-ebony-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={onClick}
    >
      {React.cloneElement(icon, { className: "h-6 w-6" })}
    </button>
  );
}

export { IconButton };
