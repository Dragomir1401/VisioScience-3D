import React from "react";
import { Link } from "react-router-dom";
import { purple_arrow } from "../assets/icons/";

const PopupBox = ({ text, link, buttonText }) => {
  return (
    <div className="popup-box cartoon-bubble-secondary flex flex-col items-center space-y-4">
      <p className="cartoon-bubble-text text-center">{text}</p>
      <p className="cartoon-bubble-text text-center"></p>
      <Link
        to={link}
        className="neo-brutalism-white neo-btn text-purple-600 flex items-center gap-4 px-4 py-4"
      >
        {buttonText}
        <img
          src={purple_arrow}
          alt="purple-arrow"
          className="w-4 h-4 object-contain purple-arrow"
        />
      </Link>
    </div>
  );
};

export default PopupBox;
