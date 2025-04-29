// src/components/PopupSidebar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { purple_arrow } from "../assets/icons";

const PopupSidebar = ({ text, link, buttonText }) => {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`
        fixed top-14 right-0
        h-[calc(100%-4rem)]
        bg-white/60 backdrop-blur-sm
        border-l-4 border-mulberry
        flex flex-col justify-between
        transition-all duration-300 ease-out z-50
        ${open ? "w-72" : "w-12"}
      `}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Tab button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="
          absolute left-[-2.5rem] top-1/2 -translate-y-1/2
          w-12 h-12
          bg-white/80 backdrop-blur-md
          border border-mulberry
          rounded-l-lg
          flex items-center justify-center
          hover:bg-white transition-colors
          relative
        "
        title={open ? "Închide" : buttonText}
      >
        <img
          src={purple_arrow}
          alt=""
          className={`
            w-5 h-5
            transform transition-transform duration-300
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {!open && showHint && (
        <div
          className="
            absolute top-1/2 right-20 -translate-y-1/2
            flex flex-col items-center
            animate-bounce left-[-5.5rem]
          "
        >
          <span className="text-3xl text-mulberry transform rotate-90">
          ⬆️ 
          </span>
          <span className="mt-1 text-xs text-mulberry font-semibold">
            Hover
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className={`
          flex-1 flex flex-col justify-center items-center
          text-center px-4 py-6 space-y-6
          overflow-hidden transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0"}
        `}
      >
        <p className="text-mulberry text-base font-semibold">{text}</p>
        <Link
          to={link}
          className="
            inline-flex items-center gap-2
            bg-gradient-to-r from-pink-500 to-mulberry
            text-white font-medium
            px-4 py-2 rounded-md
            hover:opacity-90 transition
          "
        >
          {buttonText}
          <img src={purple_arrow} alt="" className="w-4 h-4" />
        </Link>
      </div>

      {/* label when closed */}
      {!open && (
        <div
          className="
            text-xs text-mulberry
            rotate-[-90deg] origin-bottom-left
            absolute bottom-4 left-1/2 -translate-x-1/2
            select-none
          "
        >
          {buttonText}
        </div>
      )}
    </div>
  );
};

export default PopupSidebar;
