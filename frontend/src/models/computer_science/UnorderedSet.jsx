import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import ForestBackground2 from "../ForestBackground2";

const BucketScene = ({
  buckets = [],
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#7b3fe4",
  width = "100%",
  height = "100%",
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const spacing = 2;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {hoveredItem && (
        <Html
          position={[
            hoveredItem.bucketIndex * spacing,
            1.2 + hoveredItem.itemIndex * 1.2 + 0.8,
            0,
          ]}
          zIndexRange={[100, 0]}
        >
          <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs w-36">
            <div className="font-bold border-b border-gray-600 pb-1 mb-1">
              Entry
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Key:</span>
                <span className="font-mono bg-gray-700 px-1 rounded">
                  {hoveredItem.key}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bucket:</span>
                <span>{hoveredItem.bucketIndex}</span>
              </div>
            </div>
          </div>
        </Html>
      )}

      {buckets.map((bucket, i) => {
        const x = i * spacing;
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.8, 0.4, 1.8]} />
              <meshStandardMaterial color={edgeColor} />
            </mesh>
            <Text
              position={[0, 0.6, 0]}
              fontSize={0.3}
              color={textColor}
              anchorX="center"
              anchorY="middle"
            >
              b{i}
            </Text>

            {bucket.map((key, j) => {
              const isHovered =
                hoveredItem?.bucketIndex === i && hoveredItem?.itemIndex === j;
              const color = isHovered ? "#ff69b4" : nodeColor;

              return (
                <mesh
                  key={j}
                  position={[0, 1.2 + j * 1.2, 0]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredItem({ bucketIndex: i, itemIndex: j, key });
                  }}
                  onPointerOut={(e) => {
                    e.stopPropagation();
                    setHoveredItem(null);
                  }}
                >
                  <boxGeometry args={[1.4, 1, 1.4]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={isHovered ? color : "#000000"}
                    emissiveIntensity={0.5}
                  />
                  <Text
                    position={[0, 0, 0.8]}
                    fontSize={0.2}
                    color={textColor}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {key}
                  </Text>
                </mesh>
              );
            })}
          </group>
        );
      })}
    </>
  );
};

export const UnorderedSetScene = ({
  buckets = [],
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#7b3fe4",
  width = "100%",
  height = "100%",
  canvasHeight = "100%",
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 4;
  const camDist = count * spacing - 3;

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
        camera={{ position: [0, 5, 12], fov: 75 }}
        style={{ height: canvasHeight, width: width }}
      >
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ForestBackground2
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />
        <BucketScene
          buckets={buckets}
          nodeColor={nodeColor}
          edgeColor={edgeColor}
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

const UnorderedSet = (props) => {
  return (
    <div className="flex gap-6" style={{ height: "100%" }}>
      {props.showControls && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
          {/* ... existing controls ... */}
        </div>
      )}

      <div
        className={props.showControls ? "w-2/3" : "w-full"}
        style={{ height: "100%" }}
      >
        <UnorderedSetScene {...props} />
      </div>
    </div>
  );
};

export default UnorderedSet;
