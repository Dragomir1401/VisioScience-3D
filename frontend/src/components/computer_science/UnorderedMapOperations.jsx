import React, { useState } from "react";

export const MapOperations = ({ buckets, onChange }) => {
  const [hashFunc, setHashFunc] = useState("sum");
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const bucketCount = buckets.length;

  const hashMethods = {
    sum: (k) => {
      const str = String(k);
      const total = Array.from(str).reduce((s, ch) => s + ch.charCodeAt(0), 0);
      return total % bucketCount;
    },
    djb2: (k) => {
      let h = 5381;
      for (const c of String(k)) h = (h * 33) ^ c.charCodeAt(0);
      return Math.abs(h) % bucketCount;
    },
    fnv1a: (k) => {
      let h = 0x811c9dc5;
      for (let c of String(k)) h = ((h ^ c.charCodeAt(0)) * 0x01000193) >>> 0;
      return h % M;
    },
    murmur3: (k) => {
      let str = String(k),
        h = 0,
        i,
        k1;
      const C1 = 0xcc9e2d51,
        C2 = 0x1b873593;
      for (i = 0; i + 4 <= str.length; i += 4) {
        k1 =
          (str.charCodeAt(i) & 0xff) |
          ((str.charCodeAt(i + 1) & 0xff) << 8) |
          ((str.charCodeAt(i + 2) & 0xff) << 16) |
          ((str.charCodeAt(i + 3) & 0xff) << 24);
        k1 = Math.imul(k1, C1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = Math.imul(k1, C2);
        h ^= k1;
        h = (h << 13) | (h >>> 19);
        h = Math.imul(h, 5) + 0xe6546b64;
      }
      k1 = 0;
      for (let j = str.length & ~3; j < str.length; j++)
        k1 ^= (str.charCodeAt(j) & 0xff) << ((j & 3) << 3);
      k1 = Math.imul(k1, C1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, C2);
      h ^= k1;
      h ^= str.length;
      h ^= h >>> 16;
      h = Math.imul(h, 0x85ebca6b);
      h ^= h >>> 13;
      h = Math.imul(h, 0xc2b2ae35);
      h ^= h >>> 16;
      return h >>> 0 % M;
    },
    random: (k) => {
      const str = String(k);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % bucketCount;
      }
      return hash;
    },
    modulo: (k) => {
      const str = String(k);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash + str.charCodeAt(i)) % bucketCount;
      }
      return hash;
    },
  };

  const hash = hashMethods[hashFunc] || hashMethods.sum;

  const handleInsert = () => {
    if (!keyInput) return;
    const idx = hash(keyInput);
    const newBuckets = buckets.map((b, i) => {
      if (i !== idx) return [...b];
      const exists = b.find((e) => e.key === keyInput);
      if (exists) {
        return b.map((e) =>
          e.key === keyInput ? { key: keyInput, value: valueInput } : e
        );
      } else {
        return [...b, { key: keyInput, value: valueInput }];
      }
    });
    onChange(newBuckets);
    setKeyInput("");
    setValueInput("");
  };

  const handleErase = () => {
    if (!keyInput) return;
    const idx = hash(keyInput);
    const newBuckets = buckets.map((b, i) =>
      i === idx ? b.filter((e) => e.key !== keyInput) : [...b]
    );
    onChange(newBuckets);
    setKeyInput("");
  };

  const handleClear = () => onChange(buckets.map(() => []));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4">
      <h4 className="text-lg font-semibold text-mulberry">
        Operații pe unordered_map
      </h4>

      <div className="flex items-center gap-2">
        <label className="text-sm">Hash func:</label>
        <select
          value={hashFunc}
          onChange={(e) => setHashFunc(e.target.value)}
          className="border rounded px-2 py-1 checked:bg-mulberry"
        >
          <option value="sum">Sumă ASCII</option>
          <option value="djb2">DJB2</option>
          <option value="sdbm">SDBM</option>
          <option value="fnv1a">FNV-1a</option>
          <option value="murmur3">MurmurHash3</option>
          <option value="random">Random</option>
          <option value="modulo">Modulo</option>
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
        <input
          type="text"
          placeholder="Value"
          className="border rounded px-2 py-1 flex-1"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleInsert}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition"
        >
          insert(key, value)
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
        Total elemente: {buckets.reduce((acc, b) => acc + b.length, 0)}
      </div>
    </div>
  );
};
