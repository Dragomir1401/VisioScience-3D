import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100 text-purple-800 shadow-md z-50">
      <div className="max-w-8xl mx-auto py-3 px-7 flex justify-between items-center">
        <nav className="flex items-center">
          <NavLink
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent"
          >
            VisioScience3D
          </NavLink>
        </nav>
        <nav className="flex gap-8 font-medium text-lg">
          <NavLink
            to="/despre"
            className={({ isActive }) =>
              isActive
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-purple-500 hover:text-purple-500 hover:border-b-2 hover:border-purple-400 transition duration-200"
            }
          >
            Despre
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-purple-500 hover:text-purple-500 hover:border-b-2 hover:border-purple-400 transition duration-200"
            }
          >
            Contact
          </NavLink>
        </nav>
      </div>
      <div className="h-[4px] bg-gradient-to-r from-orange-500 to-purple-600"></div>
    </header>
  );
};

export default Navbar;
