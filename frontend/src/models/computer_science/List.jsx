import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground4 from "../ForestBackground4";
import {
  PlusIcon,
  ArrowLeftIcon,
  TrashIcon,
  ArrowCircleRightIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

export default function ListDemo() {
  const [elements, setElements] = useState([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [isRotating, setIsRotating] = useState(false);

  const handlePushBack = () => {
    if (!input) return;
    setElements((prev) => [...prev, input]);
    setMessage(`pushed_back ${input}`);
    setInput("");
  };
  const handlePopBack = () => {
    if (!elements.length) return setMessage("pop_back on empty list");
    const removed = elements[elements.length - 1];
    setElements((prev) => prev.slice(0, -1));
    setMessage(`popped_back ${removed}`);
  };
  const handlePushFront = () => {
    if (!input) return;
    setElements((prev) => [input, ...prev]);
    setMessage(`pushed_front ${input}`);
    setInput("");
  };
  const handlePopFront = () => {
    if (!elements.length) return setMessage("pop_front on empty list");
    const removed = elements[0];
    setElements((prev) => prev.slice(1));
    setMessage(`popped_front ${removed}`);
  };
  const handleClear = () => {
    setElements([]);
    setMessage("cleared");
  };

  const spacing = 3;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camY = 2;
  const camZ = Math.max(count * spacing, 9);

  const positions = useMemo(
    () => elements.map((_, i) => new THREE.Vector3(i * spacing, 0, 0)),
    [elements, spacing]
  );

  const arrows = useMemo(() => {
    const arr = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      const len = from.distanceTo(to) * 0.9;
      arr.push(new THREE.ArrowHelper(dir, from, len, 0x888888, 0.4, 0.2));
    }
    if (positions.length) {
      const last = positions[positions.length - 1];
      const dir = new THREE.Vector3(1, 0, 0);
      arr.push(
        new THREE.ArrowHelper(dir, last, spacing * 1.2, 0x888888, 0.4, 0.2)
      );
    }
    return arr;
  }, [positions, spacing]);

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
        <h4 className="text-lg font-semibold text-mulberry">
          Singly Linked List
        </h4>
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
            onClick={handlePushFront}
            className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm">push_front()</span>
          </button>
          <button
            onClick={handlePushBack}
            className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm">push_back()</span>
          </button>
          <button
            onClick={handlePopFront}
            className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-600 hover:to-yellow-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <ArrowCircleRightIcon className="w-5 h-5 transform rotate-180" />
            <span className="text-sm">pop_front()</span>
          </button>
          <button
            onClick={handlePopBack}
            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-sm">pop_back()</span>
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
        <Canvas camera={{ position: [centerX, camY, camZ], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground4
            isRotatingForestBackground={isRotating}
            isRotatingForestBackgroundSetter={setIsRotating}
          />

          {elements.map((val, i) => {
            const pos = positions[i];
            return (
              <group key={i} position={pos.toArray()}>
                <mesh>
                  <boxGeometry args={[2, 1, 1]} />
                  <meshStandardMaterial color="#4f46e5" />
                </mesh>
                <Text
                  position={[0, 0, 0.75]}
                  fontSize={0.3}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {val}
                </Text>
              </group>
            );
          })}

          {arrows.map((arrow, idx) => (
            <primitive key={idx} object={arrow} />
          ))}

          {positions.length > 0 && (
            <Text
              position={[
                positions[positions.length - 1].x + spacing * 1.2 + 0.5,
                0,
                0,
              ]}
              fontSize={0.3}
              color="#888888"
              anchorX="left"
              anchorY="middle"
            >
              null
            </Text>
          )}

          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </div>
  );
}
