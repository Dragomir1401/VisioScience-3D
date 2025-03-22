import React from "react";

const SideMenu = ({ items, onSelect, selectedItem }) => {
  return (
    <aside
      className="w-64 min-h-screen p-4 shadow-md 
  bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100 
  text-purple-800 rounded-r-lg"
    >
      <h2 className="text-xl font-bold mb-4">Volum obiecte</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
              selectedItem?.id === item.id
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-300 font-normal"
            }`}
          >
            <span className="text-lg">
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
            </span>{" "}
            <span>{item.label}</span>
          </button>
        ))}
      </ul>
    </aside>
  );
};

export default SideMenu;
