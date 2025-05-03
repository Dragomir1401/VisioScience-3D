// src/models/computer_science/VectorOperations.jsx
import React, { useState } from "react";

const VectorOperations = ({ elements = [], onChange }) => {
  const [value, setValue] = useState("");
  const [index, setIndex] = useState("");

  const pushBack = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onChange([...elements, num]);
    setValue("");
  };

  const popBack = () => {
    if (elements.length === 0) return;
    onChange(elements.slice(0, -1));
  };

  const insertAt = () => {
    const num = parseFloat(value);
    const idx = parseInt(index, 10);
    if (isNaN(num) || isNaN(idx) || idx < 0 || idx > elements.length) return;
    const newArr = [
      ...elements.slice(0, idx),
      num,
      ...elements.slice(idx),
    ];
    onChange(newArr);
    setValue("");
    setIndex("");
  };

  const eraseAt = () => {
    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= elements.length) return;
    const newArr = [
      ...elements.slice(0, idx),
      ...elements.slice(idx + 1),
    ];
    onChange(newArr);
    setIndex("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4">
      <h4 className="text-lg font-semibold text-mulberry">Operații pe vector</h4>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Valoare"
          className="border rounded px-2 py-1 flex-1"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <input
          type="number"
          placeholder="Index"
          className="border rounded px-2 py-1 w-24"
          value={index}
          onChange={e => setIndex(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={pushBack}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition"
        >
          push_back()
        </button>
        <button
          onClick={popBack}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded transition"
        >
          pop_back()
        </button>
        <button
          onClick={insertAt}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition"
        >
          insert()
        </button>
        <button
          onClick={eraseAt}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
        >
          erase()
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Conținut vector: [{elements.join(", ")}]
      </div>
    </div>
  );
};

export default VectorOperations;
