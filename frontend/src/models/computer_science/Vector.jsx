import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground4 from "../ForestBackground4";

const ArrayScene = ({ elements = [], spacing = 1.2 }) => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={1} />
    {elements.map((val, i) => (
      <mesh key={i} position={[i * spacing, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f46e5" />
        <Text
          position={[0, 0, 0.6]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {val}
        </Text>
      </mesh>
    ))}
  </>
);

const VectorScene = ({ elements }) => {
  const [isRotatingForestBackground, setIsRotatingForestBackground] =
    useState(false);
  const spacing = 1.2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 2;
  const camDistance = 7;

  return (
    <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
      <Canvas
        camera={{
          position: [centerX, camHeight, camDistance],
          fov: 70,
          near: 0.2,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <ForestBackground4
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={setIsRotatingForestBackground}
        />
        <ArrayScene elements={elements} spacing={spacing} />
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

export default VectorScene;
