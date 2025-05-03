import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground4 from "../ForestBackground4";

// Scene component: afișează array-ul ca o serie de cuburi numerotate
const ArrayScene = ({ elements = [], spacing = 1.2 }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {/* Fără gridHelper și axesHelper */}
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
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
};

// Componenta principală VectorScene cu Canvas mai înalt și border
const VectorScene = ({ elements }) => {
  const [isRotatingForestBackground, setIsRotatingForestBackground] = useState(false);

  return (
    <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
      <Canvas camera={{ position: [elements.length * 1.2, 4, 6], fov: 65 }}>
        <ForestBackground4
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={setIsRotatingForestBackground}
        />
        <ArrayScene elements={elements} spacing={1.2} />
      </Canvas>
    </div>
  );
};

export default VectorScene;
