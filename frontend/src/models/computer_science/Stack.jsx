import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";

export default function StackDemo() {
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
            position: [0, camHeight, camDist],
            fov: 50,
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <ForestBackground4 />

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
