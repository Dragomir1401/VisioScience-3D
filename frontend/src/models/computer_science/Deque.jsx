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
import ForestBackground4 from "../ForestBackground4";

export default function DequeDemo() {
  const [elements, setElements] = useState([]);
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
    <div className="flex gap-6">
      <div className="w-1/3 bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4">
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

      <div className="w-2/3 h-[650px] rounded-xl overflow-hidden border-2 border-mulberry relative">
        <Canvas camera={{ position: [centerX, camY, camZ], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground4 />
          {elements.map((val, i) => {
            const x = i * spacing;
            return (
              <group key={i} position={[x, 0, 0]}>
                <mesh>
                  <boxGeometry args={[1.8, 1, 1.8]} />
                  <meshStandardMaterial color="#4f46e5" />
                </mesh>
                <Text
                  position={[0, 0, 1]}
                  fontSize={0.4}
                  color="#fff"
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
                color="#10b981"
                lineWidth={2}
              />
              <Text
                position={[0 * spacing, 1.8, 0]}
                fontSize={0.3}
                color="#10b981"
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
                color="#ef4444"
                lineWidth={2}
              />
              <Text
                position={[(count - 1) * spacing, 1.8, 0]}
                fontSize={0.3}
                color="#ef4444"
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
