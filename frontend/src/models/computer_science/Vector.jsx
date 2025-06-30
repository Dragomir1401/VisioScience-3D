import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const ArrayScene = ({
  elements = [],
  spacing = 1.2,
  nodeColor = "#4f46e5",
  textColor = "#ffffff",
  backgroundColor = "#2D2D2D",
  width = "100%",
  height = "100%",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {hoveredIndex !== null && elements[hoveredIndex] !== undefined && (
        <Html position={[hoveredIndex * spacing, 0.8, 0]}>
          <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs w-32">
            <div className="font-bold border-b border-gray-600 pb-1 mb-1">
              Element
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-mono bg-gray-700 px-1 rounded">
                  {elements[hoveredIndex]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Index:</span>
                <span>{hoveredIndex}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
      {elements.map((val, i) => {
        const isHovered = i === hoveredIndex;
        const scale = isHovered ? 1.15 : 1;
        const color = isHovered ? "#ff69b4" : nodeColor;
        return (
          <mesh
            key={i}
            position={[i * spacing, 0, 0]}
            scale={scale}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIndex(i);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredIndex(null);
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={isHovered ? color : "#000000"}
              emissiveIntensity={isHovered ? 0.5 : 0}
            />
            <Text
              position={[0, 0, 0.6]}
              fontSize={0.3}
              color={textColor}
              anchorX="center"
              anchorY="middle"
            >
              {val}
            </Text>
          </mesh>
        );
      })}
    </>
  );
};

const VectorScene = ({
  elements = [],
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  width = "100%",
  height = "100%",
  canvasHeight = "100%",
}) => {
  const [isRotatingForestBackground, setIsRotatingForestBackground] =
    useState(false);
  const spacing = 1.2;
  const count = elements.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 2;
  const camDistance = 7;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid #9B6B9E",
      }}
    >
      <Canvas
        camera={{
          position: [centerX, camHeight, camDistance],
          fov: 70,
          near: 0.2,
          far: 1000,
        }}
        style={{ height: canvasHeight, width: width }}
      >
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <ForestBackground2
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={setIsRotatingForestBackground}
        />
        <ArrayScene
          elements={elements}
          spacing={spacing}
          nodeColor={nodeColor}
          textColor={textColor}
        />
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
