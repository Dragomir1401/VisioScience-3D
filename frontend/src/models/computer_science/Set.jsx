import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import { PlusIcon, TrashIcon, RefreshIcon } from "@heroicons/react/solid";

class AVLNode {
  constructor(key) {
    this.key = key;
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
  else return node;
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
    if (!node.left || !node.right) node = node.left || node.right;
    else {
      let temp = node.right;
      while (temp.left) temp = temp.left;
      node.key = temp.key;
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
  arr.push(node.key);
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

export default function AVLSetDemo() {
  const [root, setRoot] = useState(null);
  const [valueInput, setValueInput] = useState("");
  const [message, setMessage] = useState("");
  const [inorderList, setInorderList] = useState([]);
  const [isRotating, setIsRotating] = useState(false);

  const handleInsert = () => {
    if (!valueInput) return;
    const v = isNaN(valueInput) ? valueInput : Number(valueInput);
    const newRoot = insertNode(root, v);
    setRoot(newRoot);
    setMessage(`Inserted ${v}`);
    setValueInput("");
  };

  const handleDelete = () => {
    if (!valueInput) return;
    const v = isNaN(valueInput) ? valueInput : Number(valueInput);
    const newRoot = deleteNode(root, v);
    setRoot(newRoot);
    setMessage(`Deleted ${v}`);
    setValueInput("");
  };

  const handleClear = () => {
    setRoot(null);
    setMessage("Cleared all");
  };

  useEffect(() => {
    setInorderList(inorder(root));
  }, [root]);

  const flat = [];
  const edges = [];
  const total = inorder(root).length;
  const half = Math.max(total * 1.2, 5);
  computePositions(root, -half, half, 4, 2.5, flat);
  const posMap = new Map();
  flat.forEach(({ node, x, y }) => posMap.set(node.key, [x, y]));
  flat.forEach(({ node, x, y }) => {
    if (node.left) {
      const [lx, ly] = posMap.get(node.left.key);
      edges.push({ from: [x, y, 0], to: [lx, ly, 0] });
    }
    if (node.right) {
      const [rx, ry] = posMap.get(node.right.key);
      edges.push({ from: [x, y, 0], to: [rx, ry, 0] });
    }
  });

  return (
    <div className="flex gap-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
        <h4 className="text-lg font-semibold text-mulberry">
          Ordered Set (AVL)
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Value"
            className="border rounded px-2 py-1 flex-1"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleInsert}
            className="flex items-center gap-1 bg-gradient-to-r from-mulberry to-pink-500 hover:from-pink-600 hover:to-mulberry text-white py-2 px-4 rounded-lg shadow transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="text-sm">insert(v)</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white py-2 px-4 rounded-lg shadow transition"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-sm">erase(v)</span>
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
        <div className="mt-4 text-sm text-gray-700">
          In-order: {inorderList.join(", ")}
        </div>
      </div>

      <div className="w-2/3 h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
        <Canvas camera={{ position: [0, 4, 12], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <ForestBackground4
            isRotatingForestBackground={isRotating}
            isRotatingForestBackgroundSetter={setIsRotating}
          />

          {edges.map((e, i) => (
            <Line
              key={i}
              points={[e.from, e.to]}
              color="#888888"
              lineWidth={1}
            />
          ))}

          {flat.map(({ node, x, y }) => (
            <group key={node.key} position={[x, y, 0]}>
              <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#4f46e5" />
              </mesh>
              <Text
                position={[0, 0, 0.75]}
                fontSize={0.3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {node.key}
              </Text>
            </group>
          ))}

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
