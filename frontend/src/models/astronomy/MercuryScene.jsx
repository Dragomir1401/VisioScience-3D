// src/models/astronomy/MercuryScene.jsx
import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import mercuryMap from "../../assets/textures/mercury/mercurymap.jpg";
import mercuryBump from "../../assets/textures/mercury/mercurybump.jpg";

function Mercury({ rotationSpeed = 0.015 }) {
  const meshRef = useRef();
  // load the two Mercury textures
  const [map, bumpMap] = useTexture([mercuryMap, mercuryBump]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh ref={meshRef}>
      {/* slightly smaller sphere for Mercury */}
      <sphereGeometry args={[3.5, 32, 32]} />
      <meshStandardMaterial
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.02}
        metalness={0.05}
        roughness={0.85}
        toneMapped={true}
      />
    </mesh>
  );
}

function CameraLight() {
  const lightRef = useRef();
  const { camera } = useThree();
  useFrame(() => {
    lightRef.current.position.copy(camera.position);
  });
  return <pointLight ref={lightRef} intensity={0.3} />;
}

export default function ThreeMercuryScene() {
  const [isRotatingBG, setIsRotatingBG] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 1]}
      gl={{
        outputEncoding: THREE.sRGBEncoding,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "low-power",
      }}
      performance={{ min: 0.5, max: 1 }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={0.25} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x222222}
        intensity={0.4}
      />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-white">Loading Mercury…</div>
          </Html>
        }
      >
        <Mercury />
        <SpaceBackground
          isRotating={isRotatingBG}
          isRotatingSetter={setIsRotatingBG}
        />
      </Suspense>
    </Canvas>
  );
}
