import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-lavender border-b border-rosy-brown z-50 shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Brand logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple to-mulberry bg-clip-text text-transparent tracking-tight"
        >
          VisioScience 3D
        </NavLink>

        {/* Nav links */}
        <nav className="flex gap-6 font-medium text-sm sm:text-base">
          <NavLink
            to="/despre"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry"
                : "text-gray-700 hover:text-mulberry transition"
            }
          >
            Despre
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry"
                : "text-gray-700 hover:text-mulberry transition"
            }
          >
            Contact
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry"
                : "text-gray-700 hover:text-mulberry transition"
            }
          >
            Profil
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
