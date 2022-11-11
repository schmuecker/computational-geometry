import { useState } from "react";

interface Option {
  id: string;
  label: string;
}

interface RadioGroupProps {
  options: Option[];
  checkedOption: Option["id"];
  onChange: (optionId: Option["id"]) => void;
  title: string;
  subtitle: string;
}

function RadioGroup({
  options,
  checkedOption,
  onChange,
  title,
  subtitle
}: RadioGroupProps) {
  return (
    <div>
      <label className="text-base font-medium text-gray-900">{title}</label>
      <p className="text-sm leading-5 text-gray-500">{subtitle}</p>
      <fieldset className="mt-4">
        <legend className="sr-only">Notification method</legend>
        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
          {options.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                id={option.id}
                name="notification-method"
                type="radio"
                checked={option.id === checkedOption}
                onChange={() => onChange(option.id)}
                className="h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-200"
              />
              <label
                htmlFor={option.id}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export { RadioGroup };
export type { Option };
