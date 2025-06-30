import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import ForestBackground2 from "../ForestBackground2";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

export default function ArrayDemo({
  elements: externalElements = [],
  onElementsChange,
  showControls = false,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  highlightGetColor = "#10b981",
  highlightSetColor = "#f472b6",
  width = "100%",
  height = "100%",
  canvasHeight = "100%",
  layoutMode = "horizontal",
}) {
  const [internalElements, setInternalElements] = useState([]);
  const elements =
    externalElements.length > 0 ? externalElements : internalElements;
  const setElements = (newElements) => {
    if (onElementsChange) {
      onElementsChange(newElements);
    } else {
      setInternalElements(newElements);
    }
  };

  const [sizeInput, setSizeInput] = useState("");
  const [idxInput, setIdxInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [message, setMessage] = useState("");
  const [highlight, setHighlight] = useState({ index: null, type: null });
  const [isRotating, setIsRotating] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  useEffect(() => {
    document.body.style.cursor = hoveredIndex !== null ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hoveredIndex]);

  const spacing = 2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camY = 2;
  const camZ = Math.max(count * spacing, 5);

  return (
    <div className={layoutMode === "vertical" ? "flex flex-col gap-6" : "flex gap-6"} style={{ height: height }}>
      {showControls && layoutMode === "horizontal" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
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
      )}

      <div
        className={showControls && layoutMode === "horizontal" ? "w-2/3" : "w-full"}
        style={{ 
          height: layoutMode === "vertical" ? "calc(100% - 344px)" : canvasHeight,
          width: width,
          minHeight: layoutMode === "vertical" ? "500px" : "400px"
        }}
      >
        <Canvas
          camera={{ position: [centerX, camY, camZ], fov: 50 }}
          style={{ 
            height: layoutMode === "vertical" ? "calc(100% - 344px)" : canvasHeight, 
            width: width,
            minHeight: layoutMode === "vertical" ? "500px" : "400px"
          }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground2
            isRotatingForestBackground={isRotating}
            isRotatingForestBackgroundSetter={setIsRotating}
          />

          {hoveredIndex !== null && elements[hoveredIndex] !== undefined && (
            <Html position={[hoveredIndex * spacing, 1, 0]}>
              <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs w-32">
                <div className="font-bold border-b border-gray-600 pb-1 mb-1">
                  Element
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">
                    {elements[hoveredIndex]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Index:</span>
                  <span>{hoveredIndex}</span>
                </div>
              </div>
            </Html>
          )}

          {elements.map((val, i) => {
            let color = nodeColor;
            if (highlight.index === i) {
              color =
                highlight.type === "get"
                  ? highlightGetColor
                  : highlightSetColor;
            }
            const x = i * spacing;
            return (
              <group
                key={i}
                position={[x, 0, 0]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredIndex(i);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredIndex(null);
                }}
              >
                <mesh>
                  <boxGeometry args={[1.8, 1, 1.8]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <Text
                  position={[0, 0, 1]}
                  fontSize={0.35}
                  color={textColor}
                  anchorX="center"
                  anchorY="middle"
                >
                  {val}
                </Text>
                <Text
                  position={[0, -1.2, 0]}
                  fontSize={0.25}
                  color={textColor}
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

      {showControls && layoutMode === "vertical" && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 h-80">
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
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleGet}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600 text-white py-2 px-3 rounded-lg shadow transition text-sm"
            >
              <EyeIcon className="w-4 h-4" />
              <span>get()</span>
            </button>
            <button
              onClick={handleSet}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white py-2 px-3 rounded-lg shadow transition text-sm"
            >
              <PencilIcon className="w-4 h-4" />
              <span>set()</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 px-3 rounded-lg shadow transition text-sm"
            >
              <RefreshIcon className="w-4 h-4" />
              <span>clear()</span>
            </button>
          </div>

          {message && <p className="text-sm text-gray-600">{message}</p>}
          <div className="text-sm text-gray-700">Length: {elements.length}</div>
        </div>
      )}
    </div>
  );
}
