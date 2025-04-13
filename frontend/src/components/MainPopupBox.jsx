import React from "react";

const MainPopupBox = ({ text }) => {
  return (
    <div className="bg-white border-2 border-mulberry rounded-xl shadow-lg px-6 py-5 text-center max-w-md mx-auto">
      <p className="text-lg font-semibold text-purple-800">{text}</p>
    </div>
  );
};

export default MainPopupBox;
