import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";

export const UnorderedSetScene = ({ buckets }) => {
  const [isRotating, setIsRotating] = useState(false);
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 4;
  const camDist = count * spacing - 3;

  return (
    <div className="w-full h-[650px] relative rounded-xl overflow-hidden border-2 border-mulberry">
      <Canvas camera={{ position: [centerX, camHeight, camDist], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ForestBackground4
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />

        {buckets.map((bucket, i) => {
          const x = i * spacing;
          return (
            <group key={i} position={[x, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.8, 0.4, 1.8]} />
                <meshStandardMaterial color="#7b3fe4" />
              </mesh>
              <Text
                position={[0, 0.6, 0]}
                fontSize={0.3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                b{i}
              </Text>

              {bucket.map((key, j) => (
                <mesh key={j} position={[0, 1.2 + j * 1.2, 0]}>
                  <boxGeometry args={[1.4, 1, 1.4]} />
                  <meshStandardMaterial color="#4f46e5" />
                  <Text
                    position={[0, 0, 0.8]}
                    fontSize={0.2}
                    color="#ffffff"
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
