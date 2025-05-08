import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import jupiterColor from "../../assets/textures/jupiter/jupiter2_1k.jpg";
import jupiterBump from "../../assets/textures/jupiter/jupitermap.jpg";

function Jupiter({ rotationSpeed = 0.01 }) {
  const meshRef = useRef();
  const [map, bumpMap] = useTexture([jupiterColor, jupiterBump]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[7, 64, 64]} />
      <meshStandardMaterial
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.05}
        metalness={0.0}
        roughness={0.85}
        toneMapped={true}
      />
    </mesh>
  );
}

function CameraLight() {
  const lightRef = useRef();
  const { camera } = useThree();
  useFrame(() => lightRef.current.position.copy(camera.position));
  return <pointLight ref={lightRef} intensity={0.3} />;
}

export default function ThreeJupiterScene() {
  const [isRotatingBG, setIsRotatingBG] = useState(false);

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
      <ambientLight intensity={0.4} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x222222}
        intensity={0.4}
      />
      <directionalLight position={[5, 5, 5]} intensity={2.2} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-white">Loading Jupiter…</div>
          </Html>
        }
      >
        <Jupiter />
        <SpaceBackground
          isRotating={isRotatingBG}
          isRotatingSetter={setIsRotatingBG}
        />
      </Suspense>
    </Canvas>
  );
}
