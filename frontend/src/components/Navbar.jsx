import React from "react";
import { NavLink } from "react-router-dom";
import { contact, about, profile, shop } from "../assets/icons";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-rosy-brown z-50 shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <NavLink
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple to-mulberry bg-clip-text text-transparent tracking-tight"
        >
          VisioScience 3D
        </NavLink>

        <nav className="flex gap-6 font-medium text-sm sm:text-base">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry flex items-center gap-2"
                : "text-gray-700 hover:text-mulberry transition flex items-center gap-2"
            }
          >
            <img src={profile} className="w-6 h-6" />
            Profil
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry flex items-center gap-2"
                : "text-gray-700 hover:text-mulberry transition flex items-center gap-2"
            }
          >
            <img src={shop} className="w-5 h-5" />
            Magazin
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry flex items-center gap-2"
                : "text-gray-700 hover:text-mulberry transition flex items-center gap-2"
            }
          >
            <img src={about} className="w-5 h-5" />
            Despre
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-mulberry font-semibold border-b-2 border-mulberry flex items-center gap-2"
                : "text-gray-700 hover:text-mulberry transition flex items-center gap-2"
            }
          >
            <img src={contact} className="w-5 h-5" />
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
