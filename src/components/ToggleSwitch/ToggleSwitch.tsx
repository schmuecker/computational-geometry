import React from "react";

interface IToggleSwitch {
  label: string;
  onChange: (event: React.BaseSyntheticEvent) => void;
  defaultChecked: boolean;
}

function ToggleSwitch({ label, onChange, defaultChecked }: IToggleSwitch) {
  return (
    <div className="flex justify-center">
      <div className="form-check form-switch">
        <input
          className="form-check-input float-left -ml-10 h-5 w-9 cursor-pointer appearance-none rounded-full bg-white bg-gray-300 bg-contain bg-no-repeat align-top shadow-sm focus:outline-none"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
          defaultChecked={defaultChecked}
          onChange={(e) => onChange(e)}
        />
        <label
          className="form-check-label inline-block text-gray-800"
          htmlFor="flexSwitchCheckDefault"
        >
          {label}
        </label>
      </div>
    </div>
  );
}

export { ToggleSwitch };
