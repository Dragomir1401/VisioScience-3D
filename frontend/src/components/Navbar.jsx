import React from "react";
import { NavLink } from "react-router-dom";

const navbar = () => {
  return (
    <header className="header">
      <nav className="flex text-lg gap-7 font-medium">
        <NavLink
          to="/"
          className="w-40 h-15 rounded-lg bg-white items-center justify-center flex font-bold shadow-md"
        >
          <p className="orange-purple-gradient_text"> VisioScience3D </p>
        </NavLink>
      </nav>
      <nav className="flex text-lg gap-7 font-medium">
        <NavLink
          to="/despre"
          className={({ isActive }) =>
            isActive ? "text-[#da70d6]" : "hover:underline text-[#FF5F1F]"
          }
        >
          {" "}
          Despre{" "}
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "text-[#da70d6]" : "hover:underline text-[#FF5F1F]"
          }
        >
          {" "}
          Contact{" "}
        </NavLink>
      </nav>
    </header>
  );
};

export default navbar;
