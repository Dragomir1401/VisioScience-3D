import React, { useState } from "react";

export const UnorderedSetOperations = ({ buckets, onChange }) => {
  const [hashFunc, setHashFunc] = useState("sum");
  const [keyInput, setKeyInput] = useState("");
  const bucketCount = buckets.length;

  const hashMethods = {
    sum: (k) => {
      const str = String(k);
      const s = Array.from(str).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return s % bucketCount;
    },
    djb2: (k) => {
      let h = 5381;
      for (const c of String(k)) h = (h * 33) ^ c.charCodeAt(0);
      return Math.abs(h) % bucketCount;
    },
    sdbm: (k) => {
      let h = 0;
      for (const c of String(k)) h = c.charCodeAt(0) + (h << 6) + (h << 16) - h;
      return h >>> 0 % bucketCount;
    },
    random: (k) => Math.floor(Math.random() * bucketCount),
    roundRobin: (() => {
      let idx = 0;
      return (k) => (idx = (idx + 1) % bucketCount);
    })(),
  };

  const hash = hashMethods[hashFunc] || hashMethods.sum;

  const handleInsert = () => {
    if (!keyInput) return;
    const idx = hash(keyInput);
    const newBuckets = buckets.map((b, i) => {
      if (i !== idx) return [...b];
      if (b.includes(keyInput)) return [...b];
      return [...b, keyInput];
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

  const handleClear = () => onChange(buckets.map(() => []));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4">
      <h4 className="text-lg font-semibold text-mulberry">
        Operations on unordered_set
      </h4>

      <div className="flex items-center gap-2">
        <label className="text-sm">Hash:</label>
        <select
          value={hashFunc}
          onChange={(e) => setHashFunc(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="sum">Sum ASCII</option>
          <option value="djb2">DJB2</option>
          <option value="sdbm">SDBM</option>
          <option value="random">Random</option>
          <option value="roundRobin">Round-Robin</option>
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
        <button
          onClick={handleInsert}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition"
        >
          insert(key)
        </button>
        <button
          onClick={handleErase}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition"
        >
          erase(key)
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded transition"
        >
          clear()
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Total keys: {buckets.reduce((a, b) => a + b.length, 0)}
      </div>
    </div>
  );
};
