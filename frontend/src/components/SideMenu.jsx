import React from "react";

const SideMenu = ({ items, onSelect, selectedItem }) => {
  return (
    <aside className="w-64 bg-purple-100 min-h-screen p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Volum obiecte</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all ${
                selectedItem?.id === item.id
                  ? "bg-purple-600 text-white"
                  : "hover:bg-purple-200 text-purple-800"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideMenu;
