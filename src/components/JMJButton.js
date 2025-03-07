import React from 'react';

const JMJButton = ({ text, onClick, className, color }) => {
  return (
    <button
      className={`${
        color === "green"
          ? "bg-JMJ text-white hover:bg-[#5c706c] active:bg-[#455451]"
          : "bg-white text-black hover:bg-[#e6e6e6] active:bg-[#cccccc]"
      } py-2 px-4 rounded-lg transition-colors duration-150 ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default JMJButton;
