import React from "react";

const SideMenu = ({ items, onSelect, selectedItem, header }) => {
  return (
    <aside
      className="w-64 min-h-screen p-5 shadow-md bg-gradient-to-br 
      from-[#f5f3ff] via-[#ede9fe] to-[#fff7ed] text-purple-800 
      border-r border-purple-200"
    >
      <h2 className="text-xl font-bold mb-6 text-purple-700 tracking-wide">
        {header || "Objects"}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left px-4 py-2 rounded-md transition-all 
              flex items-center gap-3 shadow-sm border 
              ${
                selectedItem?.id === item.id
                  ? "bg-purple-600 text-white border-purple-700"
                  : "bg-white border-transparent hover:bg-purple-100 hover:border-purple-300"
              }`}
          >
            <img src={item.icon} alt={item.label} className="w-5 h-5" />
            <span className="text-md">{item.label}</span>
          </button>
        ))}
      </ul>
    </aside>
  );
};

export default SideMenu;
