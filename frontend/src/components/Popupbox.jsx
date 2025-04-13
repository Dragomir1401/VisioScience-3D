import React from "react";
import { Link } from "react-router-dom";
import { purple_arrow } from "../assets/icons/";

const PopupBox = ({ text, link, buttonText }) => {
  return (
    <div className="bg-white shadow-xl border-2 border-mulberry p-6 rounded-xl flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
      <p className="text-black text-base font-semibold">{text}</p>
      <Link
        to={link}
        className="bg-gradient-to-r border-2 border-mulberry from-purple-100 to-rose-100 text-black px-5 py-2 rounded-lg shadow hover:opacity-90 flex items-center gap-2 transition"
      >
        {buttonText}
        <img
          src={purple_arrow}
          alt="arrow"
          className="w-4 h-4 object-contain filter-purple"
        />
      </Link>
    </div>
  );
};

export default PopupBox;
