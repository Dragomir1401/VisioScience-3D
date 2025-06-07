import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import { PlusIcon, TrashIcon, RefreshIcon } from "@heroicons/react/solid";

class AVLNode {
  constructor(key) {
    this.key = key;
    this.count = 1;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

const height = (node) => (node ? node.height : 0);
const updateHeight = (node) => {
  node.height = 1 + Math.max(height(node.left), height(node.right));
};
const balanceFactor = (node) => height(node.left) - height(node.right);
const rotateRight = (y) => {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x;
};
const rotateLeft = (x) => {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y;
};

export function insertNode(node, key) {
  if (!node) return new AVLNode(key);
  if (key < node.key) node.left = insertNode(node.left, key);
  else if (key > node.key) node.right = insertNode(node.right, key);
  else {
    node.count++;
    return node;
  }
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1 && key < node.left.key) return rotateRight(node);
  if (bf < -1 && key > node.right.key) return rotateLeft(node);
  if (bf > 1 && key > node.left.key) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (bf < -1 && key < node.right.key) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  return node;
}

export function deleteNode(node, key) {
  if (!node) return null;
  if (key < node.key) node.left = deleteNode(node.left, key);
  else if (key > node.key) node.right = deleteNode(node.right, key);
  else {
    if (node.count > 1) {
      node.count--;
      return node;
    }
    if (!node.left || !node.right) node = node.left || node.right;
    else {
      let temp = node.right;
      while (temp.left) temp = temp.left;
      node.key = temp.key;
      node.count = temp.count;
      temp.count = 1;
      node.right = deleteNode(node.right, temp.key);
    }
  }
  if (!node) return null;
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1 && balanceFactor(node.left) >= 0) return rotateRight(node);
  if (bf > 1 && balanceFactor(node.left) < 0) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  if (bf < -1 && balanceFactor(node.right) <= 0) return rotateLeft(node);
  if (bf < -1 && balanceFactor(node.right) > 0) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  return node;
}

function inorder(node, arr = []) {
  if (!node) return arr;
  inorder(node.left, arr);
  for (let i = 0; i < node.count; i++) arr.push(node.key);
  inorder(node.right, arr);
  return arr;
}

function computePositions(node, x0, x1, y, gapY, list) {
  if (!node) return;
  const x = (x0 + x1) / 2;
  list.push({ node, x, y });
  computePositions(node.left, x0, x, y - gapY, gapY, list);
  computePositions(node.right, x, x1, y - gapY, gapY, list);
}

const MultisetScene = ({ 
  root = null,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#10b981",
  width = "100%",
  height = "100%"
}) => {
  const flat = [];
  const edges = [];
  const total = inorder(root).length;
  const half = Math.max(total * 1.2, 5);
  computePositions(root, -half, half, 4, 2.5, flat);
  const posMap = new Map();
  flat.forEach(({ node, x, y }) => posMap.set(node, [x, y]));
  flat.forEach(({ node, x, y }) => {
    if (node.left) {
      const [lx, ly] = posMap.get(node.left);
      edges.push({ from: [x, y, 0], to: [lx, ly, 0] });
    }
    if (node.right) {
      const [rx, ry] = posMap.get(node.right);
      edges.push({ from: [x, y, 0], to: [rx, ry, 0] });
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
              {node.key}
            </Text>
            {node.count > 1 && (
              <Text
                position={[0, -0.6, 0.6]}
                fontSize={0.3}
                color={textColor}
                anchorX="center"
                anchorY="middle"
              >
                x{node.count}
              </Text>
            )}
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

const MultisetDemo = ({ 
  root = null,
  onRootChange,
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#10b981",
  width = "100%",
  height = "650px"
}) => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [inorderList, setInorderList] = useState([]);

  useEffect(() => {
    setInorderList(inorder(root));
  }, [root]);

  const handleInsert = () => {
    if (!input) return;
    const v = isNaN(input) ? input : Number(input);
    const newRoot = insertNode(root, v);
    onRootChange?.(newRoot);
    setMessage(`Inserted ${v}`);
    setInput("");
  };

  const handleErase = () => {
    if (!input) return;
    const v = isNaN(input) ? input : Number(input);
    const newRoot = deleteNode(root, v);
    onRootChange?.(newRoot);
    setMessage(`Erased ${v}`);
    setInput("");
  };

  const handleClear = () => {
    onRootChange?.(null);
    setMessage("Cleared all");
  };

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry w-1/3 space-y-4">
        <h4 className="text-lg font-semibold text-mulberry">
          Ordered MultiSet (AVL)
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Value"
            className="border rounded px-2 py-1 flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleInsert}
            className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm font-medium">insert(v)</span>
          </button>

          <button
            onClick={handleErase}
            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-sm font-medium">erase(v)</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <RefreshIcon className="w-5 h-5" />
            <span className="text-sm font-medium">clear()</span>
          </button>
        </div>

        {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}

        <div className="text-sm text-gray-700">
          Contents: [{inorderList.join(", ")}]
        </div>
      </div>

      <div className="w-2/3">
        <MultisetScene 
          root={root}
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

export default MultisetDemo;
