import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import {
  PlusIcon,
  ArrowCircleLeftIcon,
  EyeIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

const QueueScene = ({ 
  elements = [],
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  frontIndicatorColor = "#10b981",
  backIndicatorColor = "#ef4444",
  width = "100%",
  height = "100%"
}) => {
  const spacing = 2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camY = 0.8;
  const camDist = Math.max(count * spacing, 10);

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '2px solid #9B6B9E'
    }}>
      <Canvas camera={{ position: [centerX, camY, camDist], fov: 50 }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ForestBackground4
          isRotatingForestBackground={false}
          isRotatingForestBackgroundSetter={() => {}}
        />

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
          </>
        )}

        {count > 0 && (
          <>
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
  );
};

const QueueDemo = ({ 
  elements = [],
  onElementsChange,
  showControls = false,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  frontIndicatorColor = "#10b981",
  backIndicatorColor = "#ef4444",
  width = "100%",
  height = "650px"
}) => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const handlePush = () => {
    if (!input) return;
    const newElements = [...elements, input];
    onElementsChange?.(newElements);
    setMessage(`pushed ${input}`);
    setInput("");
  };

  const handlePop = () => {
    if (elements.length === 0) {
      setMessage("pop on empty queue");
      return;
    }
    const popped = elements[0];
    const newElements = elements.slice(1);
    onElementsChange?.(newElements);
    setMessage(`popped ${popped}`);
  };

  const handleTop = () => {
    if (elements.length === 0) {
      setMessage("front on empty queue");
    } else {
      setMessage(`front is ${elements[0]}`);
    }
  };

  const handleClear = () => {
    onElementsChange?.([]);
    setMessage("cleared");
  };

  return (
    <div className="flex gap-6">
      {showControls && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
          <h4 className="text-lg font-semibold text-mulberry">FIFO Queue</h4>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Value"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={handlePush}
              className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm">push(v)</span>
            </button>

            <button
              onClick={handlePop}
              className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
            >
              <ArrowCircleLeftIcon className="w-5 h-5" />
              <span className="text-sm">pop()</span>
            </button>

            <button
              onClick={handleTop}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg shadow transition"
            >
              <EyeIcon className="w-5 h-5" />
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

          {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}

          <div className="text-sm text-gray-700">
            Contents: [{elements.join(", ")}]
          </div>
        </div>
      )}

      <div className={showControls ? "w-2/3" : "w-full"}>
        <QueueScene 
          elements={elements}
          backgroundColor={backgroundColor}
          textColor={textColor}
          nodeColor={nodeColor}
          frontIndicatorColor={frontIndicatorColor}
          backIndicatorColor={backIndicatorColor}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
};

export default QueueDemo;
