import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import ForestBackground2 from "../ForestBackground2";
import useMeasure from "react-use-measure";

export const UnorderedMapScene = ({
  buckets = [
    [
      { key: "John", value: 85 },
      { key: "Alice", value: 92 },
    ],
    [{ key: "Bob", value: 78 }],
    [
      { key: "Charlie", value: 88 },
      { key: "David", value: 95 },
    ],
  ],
  backgroundColor = "#2D2D2D",
  textColor = "#D4D4D4",
  nodeColor = "#9B6B9E",
  edgeColor = "#D4A5A5",
  width = "100%",
  height = "100%",
  canvasHeight = "100%",
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 8;
  const camDist = count * spacing + 2;
  const [bounds, ref] = useMeasure();

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

        {hoveredItem && (
          <Html
            position={[
              hoveredItem.bucketIndex * spacing,
              1.2 + hoveredItem.itemIndex * 1.2 + 0.8,
              0,
            ]}
          >
            <div className="bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs w-40">
              <div className="font-bold border-b border-gray-600 pb-1 mb-1">
                Entry
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Key:</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">
                    {hoveredItem.entry.key}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">
                    {hoveredItem.entry.value}
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

              {bucket.map((entry, j) => (
                <mesh
                  key={j}
                  position={[0, 1.2 + j * 1.2, 0]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredItem({ bucketIndex: i, itemIndex: j, entry });
                  }}
                  onPointerOut={(e) => {
                    e.stopPropagation();
                    setHoveredItem(null);
                  }}
                >
                  <boxGeometry args={[1.4, 1, 1.4]} />
                  <meshStandardMaterial
                    color={
                      hoveredItem?.bucketIndex === i &&
                      hoveredItem?.itemIndex === j
                        ? "#ff69b4"
                        : nodeColor
                    }
                  />
                  <Text
                    position={[0, 0, 0.8]}
                    fontSize={0.2}
                    color={textColor}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {`${entry.key}:${entry.value}`}
                  </Text>
                </mesh>
              ))}
            </group>
          );
        })}

        <OrbitControls
          target={[centerX, 2, 0]}
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

const UnorderedMap = (props) => {
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
        <UnorderedMapScene {...props} />
      </div>
    </div>
  );
};

export default UnorderedMap;
