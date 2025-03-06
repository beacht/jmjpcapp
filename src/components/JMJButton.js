import React from 'react';

const JMJButton = ({ text, onClick, className, color }) => {
  return (
    <button
      className={`${
        color === "green" ? "bg-JMJ text-white" : "bg-white text-JMJ"
      } py-2 px-4 rounded-lg mr-4 mb-4 ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default JMJButton;
