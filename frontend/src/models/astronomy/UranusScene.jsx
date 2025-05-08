import React, { useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";
import planetDiff from "../../assets/textures/uranus/13907_Uranus_planet_diff.jpg";

function Uranus({ rotationSpeed = 0.01 }) {
  const meshRef = React.useRef();
  const [colorMap] = useTexture([planetDiff]);

  useMemo(() => {
    colorMap.encoding = THREE.sRGBEncoding;
  }, [colorMap]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}

export default function ThreeUranusScene() {
  const [isRotatingBG, setIsRotatingBG] = useState(false);

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2.2} />

      <OrbitControls enablePan={false} />

      <Uranus />

      <SpaceBackground
        isRotating={isRotatingBG}
        isRotatingSetter={setIsRotatingBG}
      />
    </Canvas>
  );
}
