import React, { useState, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { a, useSprings } from "@react-spring/three";
import * as THREE from "three";
import ForestBackground4 from "../ForestBackground4";

class AVLNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}
const height = node => (node ? node.height : 0);
const updateHeight = node => (node.height = 1 + Math.max(height(node.left), height(node.right)));
const balanceFactor = node => height(node.left) - height(node.right);
const rotateRight = y => {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  updateHeight(y);
  updateHeight(x);
  return x;
};
const rotateLeft = x => {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  updateHeight(x);
  updateHeight(y);
  return y;
};
export function insertNode(node, key, value) {
  if (!node) return new AVLNode(key, value);
  if (key < node.key) node.left = insertNode(node.left, key, value);
  else if (key > node.key) node.right = insertNode(node.right, key, value);
  else { node.value = value; return node; }
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1 && key < node.left.key) return rotateRight(node);
  if (bf < -1 && key > node.right.key) return rotateLeft(node);
  if (bf > 1 && key > node.left.key) { node.left = rotateLeft(node.left); return rotateRight(node); }
  if (bf < -1 && key < node.right.key) { node.right = rotateRight(node.right); return rotateLeft(node); }
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
      node.value = temp.value;
      node.right = deleteNode(node.right, temp.key);
    }
  }
  if (!node) return null;
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1 && balanceFactor(node.left) >= 0) return rotateRight(node);
  if (bf > 1 && balanceFactor(node.left) < 0) { node.left = rotateLeft(node.left); return rotateRight(node); }
  if (bf < -1 && balanceFactor(node.right) <= 0) return rotateLeft(node);
  if (bf < -1 && balanceFactor(node.right) > 0) { node.right = rotateRight(node.right); return rotateLeft(node); }
  return node;
}

function computePositions(node, x0, x1, y, gapY, list) {
  if (!node) return;
  const x = (x0 + x1) / 2;
  list.push({ node, x, y });
  computePositions(node.left, x0, x, y - gapY, gapY, list);
  computePositions(node.right, x, x1, y - gapY, gapY, list);
}
function inorder(node, arr = []) {
  if (!node) return arr;
  inorder(node.left, arr);
  arr.push({ key: node.key, value: node.value });
  inorder(node.right, arr);
  return arr;
}

export const AVLTreeScene = ({ root }) => {
  const [isRotating, setIsRotating] = useState(false);
  const prevPosRef = useRef(new Map());

  const { nodes, edges } = useMemo(() => {
    const list = [];
    const edgeList = [];
    const count = inorder(root).length;
    const halfWidth = Math.max(count * 1.2, 5);
    computePositions(root, -halfWidth, halfWidth, 4, 2.5, list);
    const posMap = new Map();
    list.forEach(({ node, x, y }) => posMap.set(node, [x, y]));
    list.forEach(({ node, x, y }) => {
      if (node.left && posMap.has(node.left)) edgeList.push({ from: [x, y, 0], to: [...posMap.get(node.left), 0] });
      if (node.right && posMap.has(node.right)) edgeList.push({ from: [x, y, 0], to: [...posMap.get(node.right), 0] });
    });
    return { nodes: list, edges: edgeList };
  }, [root]);

  const springs = useSprings(
    nodes.length,
    nodes.map(({ node, x, y }) => {
      const prev = prevPosRef.current.get(node.key) || [x, y, 0];
      return { from: { position: prev }, to: { position: [x, y, 0] }, config: { mass: 1, tension: 50, friction: 30 } };
    })
  );

  useEffect(() => {
    nodes.forEach(({ node, x, y }) => prevPosRef.current.set(node.key, [x, y, 0]));
  }, [nodes]);

  return (
    <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
      <Canvas camera={{ position: [0, 4, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <ForestBackground4 isRotatingForestBackground={isRotating} isRotatingForestBackgroundSetter={setIsRotating} />

        {edges.map((e, i) => (
          <Line key={i} points={[e.from, e.to]} color="#888888" lineWidth={1} />
        ))}

        {springs.map((spr, i) => (
          <a.group key={nodes[i].node.key} position={spr.position}>
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#4f46e5" />
            </mesh>
            <Text position={[0, 0, 0.6]} fontSize={0.25} color="#ffffff" anchorX="center" anchorY="middle">
              {`${nodes[i].node.key}:${nodes[i].node.value}`}
            </Text>
          </a.group>
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
};
