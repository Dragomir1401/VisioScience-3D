import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  BanIcon,
} from "@heroicons/react/solid";
import ForestBackground2 from "../ForestBackground2";

export default function DequeDemo({
  elements: externalElements = [],
  onElementsChange,
  showControls = false,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  frontIndicatorColor = "#10b981",
  backIndicatorColor = "#ef4444",
  edgeColor = "#7b3fe4",
  width = "100%",
  height = "100%",
  canvasHeight = "100%",
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

  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const pushFront = () => {
    if (!input) return;
    setElements((prev) => [input, ...prev]);
    setMessage(`push_front(${input})`);
    setInput("");
  };
  const pushBack = () => {
    if (!input) return;
    setElements((prev) => [...prev, input]);
    setMessage(`push_back(${input})`);
    setInput("");
  };
  const popFront = () => {
    if (!elements.length) return void setMessage("pop_front on empty deque");
    const v = elements[0];
    setElements((prev) => prev.slice(1));
    setMessage(`pop_front() → ${v}`);
  };
  const popBack = () => {
    if (!elements.length) return void setMessage("pop_back on empty deque");
    const v = elements[elements.length - 1];
    setElements((prev) => prev.slice(0, -1));
    setMessage(`pop_back() → ${v}`);
  };
  const showFront = () =>
    setMessage(elements[0] ? `front() → ${elements[0]}` : "front on empty");
  const showBack = () =>
    setMessage(
      elements.length
        ? `back() → ${elements[elements.length - 1]}`
        : "back on empty"
    );
  const clearAll = () => {
    setElements([]);
    setMessage("clear()");
  };

  const spacing = 2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camY = 0.8;
  const camZ = Math.max(count * spacing, 10);

  return (
    <div className="flex gap-6" style={{ height: "100%" }}>
      {showControls && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
          <h4 className="text-xl font-bold text-mulberry">
            Deque &lt;T&gt; Demo
          </h4>
          <input
            type="text"
            placeholder="Valoare"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mulberry"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={pushFront}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white py-2 rounded-lg shadow"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              push_front
            </button>
            <button
              onClick={pushBack}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 rounded-lg shadow"
            >
              push_back
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={popFront}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white py-2 rounded-lg shadow"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              pop_front
            </button>
            <button
              onClick={popBack}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white py-2 rounded-lg shadow"
            >
              pop_back
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={showFront}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white py-2 rounded-lg shadow"
            >
              front()
            </button>
            <button
              onClick={showBack}
              className="flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white py-2 rounded-lg shadow"
            >
              back()
            </button>
            <button
              onClick={clearAll}
              className="flex items-center justify-center gap-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg shadow"
            >
              <TrashIcon className="w-5 h-5" />
              clear()
            </button>
          </div>
          {message && <p className="text-gray-700 mt-2">{message}</p>}
          <p className="text-sm text-gray-600">
            Conținut: [{elements.join(", ")}]
          </p>
        </div>
      )}

      <div
        className={showControls ? "w-2/3" : "w-full"}
        style={{ height: "100%" }}
      >
        <Canvas
          camera={{ position: [centerX, camY, camZ], fov: 50 }}
          style={{ height: canvasHeight, width: width }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground2 />
          {elements.map((val, i) => {
            const x = i * spacing;
            return (
              <group key={i} position={[x, 0, 0]}>
                <mesh>
                  <boxGeometry args={[1.8, 1, 1.8]} />
                  <meshStandardMaterial color={nodeColor} />
                </mesh>
                <Text
                  position={[0, 0, 1]}
                  fontSize={0.4}
                  color={textColor}
                  anchorX="center"
                  anchorY="middle"
                >
                  {val}
                </Text>
              </group>
            );
          })}
          {count > 0 && (
            <>
              <Line
                points={[
                  [0 * spacing, 1.5, 0],
                  [0 * spacing, 0.9, 0],
                ]}
                color={frontIndicatorColor}
                lineWidth={2}
              />
              <Text
                position={[0 * spacing, 1.8, 0]}
                fontSize={0.3}
                color={frontIndicatorColor}
                anchorX="center"
                anchorY="middle"
              >
                front
              </Text>
              <Line
                points={[
                  [(count - 1) * spacing, 1.5, 0],
                  [(count - 1) * spacing, 0.9, 0],
                ]}
                color={backIndicatorColor}
                lineWidth={2}
              />
              <Text
                position={[(count - 1) * spacing, 1.8, 0]}
                fontSize={0.3}
                color={backIndicatorColor}
                anchorX="center"
                anchorY="middle"
              >
                back
              </Text>
            </>
          )}
          <OrbitControls
            target={[centerX, 0, 0]}
            enablePan
            enableZoom
            enableRotate
          />
        </Canvas>
      </div>
    </div>
  );
}
