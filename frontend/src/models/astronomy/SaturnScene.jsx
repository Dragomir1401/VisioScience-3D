import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import saturnMap from "../../assets/textures/saturn/saturnmap.jpg";
import saturnRingColor from "../../assets/textures/saturn/saturnringcolor.jpg";
import saturnRingMask from "../../assets/textures/saturn/saturnringpattern.gif";

function Saturn({ rotationSpeed = 0.008 }) {
  const meshRef = useRef();
  const [map, ringColor, ringMask] = useTexture([
    saturnMap,
    saturnRingColor,
    saturnRingMask,
  ]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[6, 64, 64]} />
        <meshStandardMaterial
          map={map}
          metalness={0.1}
          roughness={0.8}
          toneMapped
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 12, 128]} />
        <meshStandardMaterial
          map={ringColor}
          alphaMap={ringMask}
          transparent
          side={THREE.DoubleSide}
          toneMapped
        />
      </mesh>
    </group>
  );
}

function CameraLight() {
  const lightRef = useRef();
  const { camera } = useThree();
  useFrame(() => lightRef.current.position.copy(camera.position));
  return <pointLight ref={lightRef} intensity={0.25} />;
}

export default function ThreeSaturnScene() {
  const [rotBG, setRotBG] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 45 }}
      dpr={[1, 1]}
      gl={{
        outputEncoding: THREE.sRGBEncoding,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "low-power",
      }}
      performance={{ min: 0.5, max: 1 }}
    >
      <ambientLight intensity={0.3} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x222222}
        intensity={0.3}
      />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-white">Loading Saturn…</div>
          </Html>
        }
      >
        <Saturn />
        <SpaceBackground isRotating={rotBG} isRotatingSetter={setRotBG} />
      </Suspense>
    </Canvas>
  );
}
