import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import ForestBackground4 from "../ForestBackground4";
import useMeasure from "react-use-measure";

export const UnorderedMapScene = ({ 
  buckets = [
    [{ key: "John", value: 85 }, { key: "Alice", value: 92 }],
    [{ key: "Bob", value: 78 }],
    [{ key: "Charlie", value: 88 }, { key: "David", value: 95 }],
  ],
  backgroundColor = "#2D2D2D",
  textColor = "#D4D4D4",
  nodeColor = "#9B6B9E",
  edgeColor = "#D4A5A5",
  width = "100%",
  height = "100%",
  canvasHeight = "100%"
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const spacing = 2;
  const count = buckets.length;
  const centerX = count > 0 ? ((count - 1) * spacing) / 2 : 0;
  const camHeight = 8;
  const camDist = count * spacing + 2;
  const [bounds, ref] = useMeasure();

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative', 
      borderRadius: '8px', 
      overflow: 'hidden',
      border: '2px solid #9B6B9E',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Canvas 
        camera={{ 
          position: [centerX, camHeight, camDist], 
          fov: 75,
          near: 0.1,
          far: 1000
        }} 
        style={{
          flex: 1,
          width: '100%',
          height: '100%'
        }}
        width={bounds.width}
        height={bounds.height}
      >
        <color attach="background" args={[backgroundColor]} />
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
  return <UnorderedMapScene {...props} />;
};

export default UnorderedMap;
