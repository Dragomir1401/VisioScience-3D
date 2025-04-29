import React from "react";
import { purple_arrow } from "../assets/icons/";

const MainPopupBox = ({ text }) => {
  return (
    <>
      <aside className="
        fixed top-14 right-0 h-full w-64 
        bg-white/90 backdrop-blur-md 
        border-l-2 border-mulberry 
        flex flex-col justify-between 
        p-6 
        z-50
      ">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-800">{text}</h2>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-8 h-10 text-mulberry animate-bounce">
              <svg
                width="24"
                height="36"
                viewBox="0 0 24 36"
                className="w-full h-full"
              >
                <rect
                  x="1" y="1" width="22" height="34"
                  rx="11"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="12" y1="8" x2="12" y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Click pe scenă</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 animate-[drag_1s_ease-in-out_infinite_alternate]">
              <img
                src={purple_arrow}
                alt="săgeată stânga"
                className="w-4 h-4 rotate-180"
              />
              <img
                src={purple_arrow}
                alt="săgeată dreapta"
                className="w-4 h-4"
              />
            </div>
            <span className="text-sm text-gray-600">Trage stânga–dreapta</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ține apăsat și mută cursorul pentru a roti.
          </p>
        </div>
      </aside>

      <style>{`
        @keyframes drag {
          from { transform: translateX(-4px); }
          to   { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
};

export default MainPopupBox;
