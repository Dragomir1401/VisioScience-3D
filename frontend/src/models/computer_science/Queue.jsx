import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";

export default function QueueDemo() {
  const [elements, setElements] = useState([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const handlePush = () => {
    if (input === "") return;
    setElements((prev) => [...prev, input]);
    setMessage(`pushed ${input}`);
    setInput("");
  };

  const handlePop = () => {
    if (elements.length === 0) {
      setMessage("pop on empty queue");
      return;
    }
    const popped = elements[0];
    setElements((prev) => prev.slice(1));
    setMessage(`popped ${popped}`);
  };

  const handleTop = () => {
    if (elements.length === 0) {
      setMessage("top on empty queue");
    } else {
      setMessage(`front is ${elements[0]}`);
    }
  };

  const handleClear = () => {
    setElements([]);
    setMessage("cleared");
  };

  const spacing = 2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 5;
  const camDist = Math.max(count * spacing, 5);

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
        <h4 className="text-lg font-semibold text-mulberry">FIFO Queue</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePush}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            push(v)
          </button>
          <button
            onClick={handlePop}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            pop()
          </button>
          <button
            onClick={handleTop}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            top()
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            clear()
          </button>
        </div>
        {message && <div className="text-sm text-gray-700">{message}</div>}
        <div className="text-sm text-gray-700">
          Contents: [{elements.join(", ")}]
        </div>
      </div>

      <div className="w-2/3 h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
        <Canvas
          camera={{
            position: [centerX, camHeight, camDist],
            fov: 50,
          }}
        >
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
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {val}
                </Text>
              </group>
            );
          })}

          {elements.length > 0 && (
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
            </>
          )}

          {elements.length > 0 && (
            <>
              <Line
                points={[
                  [(elements.length - 1) * spacing, 1.5, 0],
                  [(elements.length - 1) * spacing, 0.9, 0],
                ]}
                color="#ef4444"
                lineWidth={2}
              />
              <Text
                position={[(elements.length - 1) * spacing, 1.8, 0]}
                fontSize={0.3}
                color="#ef4444"
                anchorX="center"
                anchorY="middle"
              >
                back
              </Text>
            </>
          )}

          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </div>
    </div>
  );
}
