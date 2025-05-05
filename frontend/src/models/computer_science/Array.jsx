import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

export default function ArrayDemo() {
  const [sizeInput, setSizeInput] = useState("");
  const [elements, setElements] = useState([]);
  const [idxInput, setIdxInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [message, setMessage] = useState("");
  const [highlight, setHighlight] = useState({ index: null, type: null });
  const [isRotating, setIsRotating] = useState(false);

  const handleCreate = () => {
    const n = parseInt(sizeInput, 10);
    if (isNaN(n) || n < 0) return setMessage("Invalid size");
    setElements(Array(n).fill(""));
    setMessage(`Created array of size ${n}`);
    setHighlight({ index: null, type: null });
    setSizeInput("");
  };

  const handleGet = () => {
    const i = parseInt(idxInput, 10);
    if (isNaN(i) || i < 0 || i >= elements.length)
      return setMessage("Index out of bounds");
    setMessage(`Got elements[${i}] = ${elements[i]}`);
    setHighlight({ index: i, type: "get" });
  };

  const handleSet = () => {
    const i = parseInt(idxInput, 10);
    if (isNaN(i) || i < 0 || i >= elements.length)
      return setMessage("Index out of bounds");
    const v = valInput;
    setElements((prev) => {
      const nxt = [...prev];
      nxt[i] = v;
      return nxt;
    });
    setMessage(`Set elements[${i}] = ${v}`);
    setHighlight({ index: i, type: "set" });
    setValInput("");
  };

  const handleClear = () => {
    setElements([]);
    setMessage("Cleared array");
    setHighlight({ index: null, type: null });
  };

  useEffect(() => {
    if (highlight.index === null) return;
    const t = setTimeout(() => setHighlight({ index: null, type: null }), 1000);
    return () => clearTimeout(t);
  }, [highlight]);

  const spacing = 2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camY = 2;
  const camZ = Math.max(count * spacing, 25);

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
        <h4 className="text-lg font-semibold text-mulberry">Static Array</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Size"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            onClick={handleCreate}
            className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-teal-400 hover:from-teal-500 hover:to-green-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm">create()</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Index"
            value={idxInput}
            onChange={(e) => setIdxInput(e.target.value)}
            className="w-20 border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Value"
            value={valInput}
            onChange={(e) => setValInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGet}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <EyeIcon className="w-5 h-5" />
            <span className="text-sm">get()</span>
          </button>
          <button
            onClick={handleSet}
            className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PencilIcon className="w-5 h-5" />
            <span className="text-sm">set()</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <RefreshIcon className="w-5 h-5" />
            <span className="text-sm">clear()</span>
          </button>
        </div>

        {message && <p className="text-sm text-gray-600">{message}</p>}
        <div className="text-sm text-gray-700">Length: {elements.length}</div>
      </div>

      <div className="w-2/3 h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
        <Canvas camera={{ position: [centerX, camY, camZ], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground4
            isRotatingForestBackground={isRotating}
            isRotatingForestBackgroundSetter={setIsRotating}
          />

          {elements.map((val, i) => {
            let color = "#4f46e5";
            if (highlight.index === i) {
              color = highlight.type === "get" ? "#10b981" : "#f472b6";
            }
            const x = i * spacing;
            return (
              <group key={i} position={[x, 0, 0]}>
                <mesh>
                  <boxGeometry args={[1.8, 1, 1.8]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <Text
                  position={[0, 0, 1]}
                  fontSize={0.35}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {val}
                </Text>
                <Text
                  position={[0, -1.2, 0]}
                  fontSize={0.25}
                  color="#333333"
                  anchorX="center"
                  anchorY="middle"
                >
                  {i}
                </Text>
              </group>
            );
          })}

          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </div>
  );
}
