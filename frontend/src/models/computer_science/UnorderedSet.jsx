import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";

const BucketScene = ({ 
  buckets = [],
  backgroundColor = "#2D2D2D",
  textColor = "#ffffff",
  nodeColor = "#4f46e5",
  edgeColor = "#7b3fe4",
  width = "100%",
  height = "100%"
}) => {
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
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

            {bucket.map((key, j) => (
              <mesh key={j} position={[0, 1.2 + j * 1.2, 0]}>
                <boxGeometry args={[1.4, 1, 1.4]} />
                <meshStandardMaterial color={nodeColor} />
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
            ))}
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
  canvasHeight = "100%"
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 4;
  const camDist = count * spacing - 3;

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '2px solid #9B6B9E'
    }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 75 }} style={{ height: canvasHeight, width: width }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ForestBackground4
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
    <div className="flex gap-6" style={{ height: '100%' }}>
      {props.showControls && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry space-y-4 w-1/3">
          {/* ... existing controls ... */}
        </div>
      )}

      <div className={props.showControls ? "w-2/3" : "w-full"} style={{ height: '100%' }}>
        <UnorderedSetScene {...props} />
      </div>
    </div>
  );
};

export default UnorderedSet;
