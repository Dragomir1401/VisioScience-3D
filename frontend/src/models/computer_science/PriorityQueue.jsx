// src/models/computer_science/PriorityQueueDemo.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";

// ----- Priority Queue (binary heap tree) -----
class PriorityQueue {
  constructor(comparator) {
    this.heap = [];
    this.compare = comparator;
  }
  push(val) {
    this.heap.push(val);
    this._siftUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }
  peek() {
    return this.heap[0] ?? null;
  }
  size() {
    return this.heap.length;
  }
  _siftUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
        [this.heap[idx], this.heap[parent]] = [
          this.heap[parent],
          this.heap[idx],
        ];
        idx = parent;
      } else break;
    }
  }
  _siftDown(idx) {
    const n = this.heap.length;
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let best = idx;
      if (left < n && this.compare(this.heap[left], this.heap[best]) < 0)
        best = left;
      if (right < n && this.compare(this.heap[right], this.heap[best]) < 0)
        best = right;
      if (best !== idx) {
        [this.heap[idx], this.heap[best]] = [this.heap[best], this.heap[idx]];
        idx = best;
      } else break;
    }
  }
}

// Tree builder from heap array
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
// In-order traversal to list nodes
const inorder = (node, arr = []) => {
  if (!node) return arr;
  inorder(node.left, arr);
  arr.push(node);
  inorder(node.right, arr);
  return arr;
};
// Compute positions
const computePositions = (node, x0, x1, y, gapY, list) => {
  if (!node) return;
  const x = (x0 + x1) / 2;
  list.push({ node, x, y });
  computePositions(node.left, x0, x, y - gapY, gapY, list);
  computePositions(node.right, x, x1, y - gapY, gapY, list);
};

export default function PriorityQueueDemo() {
  const comparators = {
    min: (a, b) => a - b,
    max: (a, b) => b - a,
  };
  const [type, setType] = useState("min");
  const [value, setValue] = useState("");
  const [pq, setPq] = useState(new PriorityQueue(comparators[type]));
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const newPq = new PriorityQueue(comparators[type]);
    pq.heap.forEach((v) => newPq.push(v));
    setPq(newPq);
  }, [type]);

  const list = useMemo(() => [...pq.heap], [pq]);

  const handlePush = () => {
    if (value === "") return;
    const v = isNaN(value) ? value : Number(value);
    const newPq = new PriorityQueue(comparators[type]);
    pq.heap.forEach((x) => newPq.push(x));
    newPq.push(v);
    setPq(newPq);
    setMsg(`Pushed ${v}`);
    setValue("");
  };
  const handlePop = () => {
    if (pq.size() === 0) return;
    const newPq = new PriorityQueue(comparators[type]);
    pq.heap.forEach((x) => newPq.push(x));
    const top = newPq.pop();
    setPq(newPq);
    setMsg(`Popped ${top}`);
  };
  const handleClear = () => {
    setPq(new PriorityQueue(comparators[type]));
    setMsg(`Cleared`);
  };

  // build tree and compute positions
  const root = buildTree(list);
  const flat = [];
  const edges = [];
  const total = list.length;
  const halfWidth = Math.max(total * 1.5, 5);
  computePositions(root, -halfWidth, halfWidth, 4, 2.5, flat);
  const posMap = new Map();
  flat.forEach(({ node, x, y }) => posMap.set(node, [x, y]));
  flat.forEach(({ node }) => {
    if (node.left)
      edges.push({ from: posMap.get(node), to: posMap.get(node.left) });
    if (node.right)
      edges.push({ from: posMap.get(node), to: posMap.get(node.right) });
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry max-w-md mx-auto">
        <h4 className="text-lg font-semibold text-mulberry">
          Priority Queue ({type}-heap)
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="min">Min-Heap</option>
            <option value="max">Max-Heap</option>
          </select>
          <input
            type="text"
            placeholder="Value"
            className="border rounded px-2 py-1 flex-1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handlePush}
            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
          >
            push(v)
          </button>
          <button
            onClick={handlePop}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            pop()
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
          >
            clear()
          </button>
        </div>
        {msg && <p className="text-sm text-gray-600 mt-2">{msg}</p>}
      </div>

      <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
        <Canvas camera={{ position: [0, 4, 12], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <ForestBackground4 />

          {edges.map((e, i) => (
            <Line
              key={i}
              points={[
                [...e.from, 0],
                [...e.to, 0],
              ]}
              color="#888888"
              lineWidth={2}
            />
          ))}

          {flat.map(({ node, x, y }, i) => (
            <group key={i} position={[x, y, 0]}>
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
                {node.value}
              </Text>
            </group>
          ))}

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
