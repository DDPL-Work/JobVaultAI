import React from "react";

export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  ariaLabel = "Toggle",
}) {
  return (
    <label
      className={`relative inline-flex items-center select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          if (!disabled && onChange) {
            onChange(e.target.checked, e);
          }
        }}
        aria-label={ariaLabel}
      />
      <div
        className={`w-[36px] h-[20px] rounded-full transition-colors duration-150 relative peer-focus-visible:ring-2 peer-focus-visible:ring-[#9C6B12] peer-focus-visible:ring-offset-2 ${
          checked ? "bg-[#9C6B12]" : "bg-[#DCE1E8]"
        }`}
      >
        <div
          className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
            checked ? "translate-x-[16px]" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}
