import React, { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ArrowCircleLeftIcon,
} from "@heroicons/react/solid";

export const UnorderedSetOperations = ({ buckets, onChange }) => {
  const [hashFunc, setHashFunc] = useState("sum");
  const [keyInput, setKeyInput] = useState("");
  const bucketCount = buckets.length;

  const hashMethods = {
    sum: (k) => {
      const total = Array.from(String(k)).reduce(
        (acc, c) => acc + c.charCodeAt(0),
        0
      );
      return total % bucketCount;
    },
    djb2: (k) => {
      let h = 5381;
      for (const c of String(k)) h = (h * 33) ^ c.charCodeAt(0);
      return Math.abs(h) % bucketCount;
    },
    sdbm: (k) => {
      let h = 0;
      for (const c of String(k)) h = c.charCodeAt(0) + (h << 6) + (h << 16) - h;
      return (h >>> 0) % bucketCount;
    },
    random: () => Math.floor(Math.random() * bucketCount),
    roundRobin: (() => {
      let idx = 0;
      return () => (idx = (idx + 1) % bucketCount);
    })(),
  };

  const hash = hashMethods[hashFunc] || hashMethods.sum;

  const handleInsert = () => {
    if (!keyInput) return;
    const idx = hash(keyInput);
    const newBuckets = buckets.map((b, i) => {
      if (i !== idx) return [...b];
      return b.includes(keyInput) ? [...b] : [...b, keyInput];
    });
    onChange(newBuckets);
    setKeyInput("");
  };

  const handleErase = () => {
    if (!keyInput) return;
    const idx = hash(keyInput);
    const newBuckets = buckets.map((b, i) =>
      i === idx ? b.filter((k) => k !== keyInput) : [...b]
    );
    onChange(newBuckets);
    setKeyInput("");
  };

  const handleClear = () => {
    onChange(buckets.map(() => []));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-6 max-w-md">
      <h4 className="text-lg font-semibold text-mulberry">
        Operații pe unordered_set
      </h4>

      <div className="flex items-center gap-2">
        <label className="text-sm">Hash funcție:</label>
        <select
          value={hashFunc}
          onChange={(e) => setHashFunc(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="sum">Sumă ASCII</option>
          <option value="djb2">DJB2</option>
          <option value="sdbm">SDBM</option>
          <option value="random">Random</option>
          <option value="roundRobin">Round‐Robin</option>
        </select>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Key"
          className="border rounded px-2 py-1 flex-1"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleInsert}
          className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm font-medium">insert(key)</span>
        </button>
        <button
          onClick={handleErase}
          className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <TrashIcon className="w-5 h-5" />
          <span className="text-sm font-medium">erase(key)</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 px-4 rounded-lg shadow transition"
        >
          <ArrowCircleLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">clear()</span>
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Total chei: {buckets.reduce((acc, b) => acc + b.length, 0)}
      </div>
    </div>
  );
};
