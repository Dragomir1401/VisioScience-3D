import React, { useState } from "react";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
} from "@heroicons/react/solid";

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
    const newArr = [...elements.slice(0, idx), num, ...elements.slice(idx)];
    onChange(newArr);
    setValue("");
    setIndex("");
  };

  const eraseAt = () => {
    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= elements.length) return;
    const newArr = [...elements.slice(0, idx), ...elements.slice(idx + 1)];
    onChange(newArr);
    setIndex("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-6 max-w-md">
      <h4 className="text-lg font-semibold text-mulberry">
        Operații pe vector
      </h4>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Valoare"
          className="border rounded px-2 py-1 flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <input
          type="number"
          placeholder="Index"
          className="border rounded px-2 py-1 w-24"
          value={index}
          onChange={(e) => setIndex(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={pushBack}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">push_back()</span>
        </button>
        <button
          onClick={popBack}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">pop_back()</span>
        </button>
        <button
          onClick={insertAt}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <ArrowRightIcon className="w-5 h-5" />
          <span className="text-sm font-medium">insert()</span>
        </button>
        <button
          onClick={eraseAt}
          className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <TrashIcon className="w-5 h-5" />
          <span className="text-sm font-medium">erase()</span>
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Conținut vector: [{elements.join(", ")}]
      </div>
    </div>
  );
};

export default VectorOperations;
