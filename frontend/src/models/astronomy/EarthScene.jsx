import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import colorMap   from "../../assets/textures/earth/Color Map - Copy.jpg";
import emissiveMap from "../../assets/textures/earth/Night Lights - Copy.jpg";
import cloudsMap   from "../../assets/textures/earth/Clouds - Copy.png";

function Earth({ rotationSpeed = 0.02 }) {
  const meshRef = useRef();
  const [diffuse, emissive, clouds] = useTexture([
    colorMap,
    emissiveMap,
    cloudsMap,
  ]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[5.05, 64, 64]} />
        <meshStandardMaterial
          map={clouds}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          map={diffuse}             
          emissiveMap={emissive}  
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

function CameraLight() {
  const lightRef = useRef();
  const { camera } = useThree();
  useFrame(() => lightRef.current.position.copy(camera.position));
  return <pointLight ref={lightRef} intensity={0.4} />;
}

export default function ThreeEarthScene() {
  const [isRotating, setIsRotating] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      dpr={[1, 1]}
      gl={{
        outputEncoding: THREE.sRGBEncoding,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        powerPreference: "low-power",
      }}
      performance={{ min: 0.5, max: 1 }}
    >
      <ambientLight intensity={8} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x222222} intensity={1.6}/>
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-white">Loading Earth…</div>
          </Html>
        }
      >
        <Earth />
        <SpaceBackground
          isRotating={isRotating}
          isRotatingSetter={setIsRotating}
        />
      </Suspense>
    </Canvas>
  );
}
