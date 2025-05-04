import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
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
const height = (node) => (node ? node.height : 0);
const updateHeight = (node) =>
  (node.height = 1 + Math.max(height(node.left), height(node.right)));
const balanceFactor = (node) => height(node.left) - height(node.right);
const rotateRight = (y) => {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
};
const rotateLeft = (x) => {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
};
export function insertNode(node, key, value) {
  if (!node) return new AVLNode(key, value);
  if (key < node.key) node.left = insertNode(node.left, key, value);
  else if (key > node.key) node.right = insertNode(node.right, key, value);
  else {
    node.value = value;
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

function computePositions(node, x0, x1, y, gapY, list) {
  if (!node) return;
  const x = (x0 + x1) / 2;
  list.push({ node, x, y });
  computePositions(node.left, x0, x, y - gapY, gapY, list);
  computePositions(node.right, x, x1, y - gapY, gapY, list);
}

export const AVLTreeScene = ({ root }) => {
  const [isRotating, setIsRotating] = useState(false);
  const nodes = [];
  const width = 10;
  const heightStart = 4;
  const gapY = 2;
  computePositions(root, -width, width, heightStart, gapY, nodes);

  return (
    <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
      <Canvas camera={{ position: [0, 3, 15], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <ForestBackground4
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />

        {nodes.map(({ node, x, y }, i) => (
          <group key={i} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#4f46e5" />
            </mesh>
            <Text
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {node.key}
            </Text>
          </group>
        ))}

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};
