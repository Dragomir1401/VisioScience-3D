import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import {
  PlusIcon,
  TrashIcon,
  RefreshIcon,
  ArrowCircleLeftIcon,
} from "@heroicons/react/solid";

export default function StackDemo() {
  const [elements, setElements] = useState([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [isRotating, setIsRotating] = useState(false);

  const handlePush = () => {
    if (!input) return;
    setElements((prev) => [...prev, input]);
    setMessage(`pushed ${input}`);
    setInput("");
  };

  const handlePop = () => {
    if (elements.length === 0) {
      setMessage("pop on empty stack");
      return;
    }
    const top = elements[elements.length - 1];
    setElements((prev) => prev.slice(0, -1));
    setMessage(`popped ${top}`);
  };

  const handleTop = () => {
    if (elements.length === 0) {
      setMessage("top on empty stack");
    } else {
      setMessage(`top is ${elements[elements.length - 1]}`);
    }
  };

  const handleClear = () => {
    setElements([]);
    setMessage("cleared");
  };

  const spacing = 1.6;
  const count = elements.length;
  const centerY = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = centerY + 2;
  const camDist = Math.max(count * spacing + 5, 10);

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
        <h4 className="text-lg font-semibold text-mulberry">LIFO Stack</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePush}
            className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm">push()</span>
          </button>
          <button
            onClick={handlePop}
            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-sm">pop()</span>
          </button>
          <button
            onClick={handleTop}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <ArrowCircleLeftIcon className="w-5 h-5" />
            <span className="text-sm">top()</span>
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
        <div className="text-sm text-gray-700">
          Contents: [{elements.join(", ")}]
        </div>
      </div>

      <div className="w-2/3 h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
        <Canvas
          camera={{
            position: [0, camHeight, camDist],
            fov: 50,
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground4
            isRotatingForestBackground={isRotating}
            isRotatingForestBackgroundSetter={setIsRotating}
          />

          {elements.map((val, i) => {
            const y = i * spacing;
            return (
              <group key={i} position={[0, y, 0]}>
                <mesh>
                  <boxGeometry args={[1.8, 1, 1.8]} />
                  <meshStandardMaterial color="#4f46e5" />
                </mesh>
                <Text
                  position={[0, 0, 1]}
                  fontSize={0.4}
                  color="#ffffff"
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
                  [0, (count - 1) * spacing + 1.2, 0],
                  [0, (count - 1) * spacing + 0.4, 0],
                ]}
                color="#10b981"
                lineWidth={2}
              />
              <Text
                position={[0, (count - 1) * spacing + 1.5, 0]}
                fontSize={0.3}
                color="#10b981"
                anchorX="center"
                anchorY="middle"
              >
                top
              </Text>
            </>
          )}

          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </div>
  );
}
