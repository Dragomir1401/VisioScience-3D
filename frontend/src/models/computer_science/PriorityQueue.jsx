import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import {
  PlusIcon,
  ArrowCircleDownIcon,
  RefreshIcon,
} from "@heroicons/react/solid";

const PriorityQueueScene = ({ 
  elements = [],
  type = "min",
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#10b981",
  width = "100%",
  height = "100%"
}) => {
  const list = useMemo(() => [...elements], [elements]);
  const root = buildTree(list);
  const flat = [];
  const edges = [];
  const total = list.length;
  const halfWidth = Math.max(total * 1.5, 5);
  computePositions(root, -halfWidth, halfWidth, 4, 2.5, flat);
  const posMap = new Map();
  flat.forEach(({ node, x, y }) => posMap.set(node, [x, y]));
  flat.forEach(({ node }) => {
    if (node.left) {
      edges.push({
        from: [...posMap.get(node), 0],
        to: [...posMap.get(node.left), 0],
      });
    }
    if (node.right) {
      edges.push({
        from: [...posMap.get(node), 0],
        to: [...posMap.get(node.right), 0],
      });
    }
  });

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '2px solid #9B6B9E'
    }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ForestBackground4
          isRotatingForestBackground={false}
          isRotatingForestBackgroundSetter={() => {}}
        />

        {edges.map((edge, i) => (
          <Line
            key={i}
            points={[edge.from, edge.to]}
            color={edgeColor}
            lineWidth={2}
          />
        ))}

        {flat.map(({ node, x, y }, i) => (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={nodeColor} />
            </mesh>
            <Text
              position={[0, 0, 0.6]}
              fontSize={0.4}
              color={textColor}
              anchorX="center"
              anchorY="middle"
            >
              {node.value}
            </Text>
          </group>
        ))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
        />
      </Canvas>
    </div>
  );
};

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const buildTree = (arr) => {
  if (!arr.length) return null;
  const nodes = arr.map((v) => new TreeNode(v));
  arr.forEach((_, i) => {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < arr.length) nodes[i].left = nodes[left];
    if (right < arr.length) nodes[i].right = nodes[right];
  });
  return nodes[0];
};

const inorder = (node, arr = []) => {
  if (!node) return arr;
  inorder(node.left, arr);
  arr.push(node);
  inorder(node.right, arr);
  return arr;
};

const computePositions = (node, x0, x1, y, gapY, list) => {
  if (!node) return;
  const x = (x0 + x1) / 2;
  list.push({ node, x, y });
  computePositions(node.left, x0, x, y - gapY, gapY, list);
  computePositions(node.right, x, x1, y - gapY, gapY, list);
};

const PriorityQueueDemo = ({ 
  elements = [],
  onElementsChange,
  type = "min",
  onTypeChange,
  showControls = false,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#10b981",
  width = "100%",
  height = "100%",
  canvasHeight = "100%"
}) => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [heap, setHeap] = useState([]);

  // Rebuild heap when type changes
  useEffect(() => {
    const newHeap = [...elements];
    if (type === "min") {
      newHeap.sort((a, b) => a - b);
    } else {
      newHeap.sort((a, b) => b - a);
    }
    setHeap(newHeap);
  }, [type, elements]);

  const handlePush = () => {
    if (!input) return;
    const v = isNaN(input) ? input : Number(input);
    const newHeap = [...heap, v];
    if (type === "min") {
      newHeap.sort((a, b) => a - b);
    } else {
      newHeap.sort((a, b) => b - a);
    }
    setHeap(newHeap);
    onElementsChange?.(newHeap);
    setMessage(`Pushed ${v}`);
    setInput("");
  };

  const handlePop = () => {
    if (heap.length === 0) {
      setMessage("Pop on empty queue");
      return;
    }
    const top = heap[0];
    const newHeap = heap.slice(1);
    setHeap(newHeap);
    onElementsChange?.(newHeap);
    setMessage(`Popped ${top}`);
  };

  const handleClear = () => {
    setHeap([]);
    onElementsChange?.([]);
    setMessage("Cleared");
  };

  return (
    <div className="flex gap-6" style={{ height: '100%' }}>
      {showControls && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
          <h4 className="text-lg font-semibold text-mulberry">
            Priority Queue ({type === "min" ? "Min-Heap" : "Max-Heap"})
          </h4>

          <div className="flex items-center gap-2 mt-4">
            <select
              value={type}
              onChange={(e) => onTypeChange?.(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="min">Min-Heap</option>
              <option value="max">Max-Heap</option>
            </select>
            <input
              type="text"
              placeholder="Value"
              className="border rounded px-2 py-1 flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handlePush}
              className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm">push()</span>
            </button>

            <button
              onClick={handlePop}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg shadow transition"
            >
              <ArrowCircleDownIcon className="w-5 h-5" />
              <span className="text-sm">pop()</span>
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
            Contents: [{heap.join(", ")}]
          </div>
        </div>
      )}

      <div className={showControls ? "w-2/3" : "w-full"} style={{ height: '100%' }}>
        <PriorityQueueScene 
          elements={heap}
          type={type}
          backgroundColor={backgroundColor}
          textColor={textColor}
          nodeColor={nodeColor}
          edgeColor={edgeColor}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
};

export default PriorityQueueDemo;
