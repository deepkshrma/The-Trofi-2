import React from "react";

function ToggleButton({ isOn, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-[2px] transition-all duration-300 ease-in-out cursor-pointer shadow-md
        ${
          isOn
            ? "bg-gradient-to-r from-green-500 to-green-500 shadow-green-400/50"
            : "bg-gradient-to-r from-gray-300 to-[#F9832B] shadow-[#F9832B]/50"
        }
      `}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full  transform transition-transform duration-300 ease-in-out
          ${isOn ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}

export default ToggleButton;
