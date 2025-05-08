import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import venusMap from "../../assets/textures/venus/venusmap.jpg";
import venusBump from "../../assets/textures/venus/venusbump.jpg";

function Venus({ rotationSpeed = 0.02 }) {
  const meshRef = useRef();
  const [map, bumpMap] = useTexture([venusMap, venusBump]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4.5, 32, 32]} />
      <meshStandardMaterial
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.05}
        metalness={0.1}
        roughness={0.9}
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
  return <pointLight ref={lightRef} intensity={0.4} />;
}

export default function VenusScene() {
  const [isRotatingBG, setIsRotatingBG] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 50 }}
      dpr={[1, 1]}
      gl={{
        outputEncoding: THREE.sRGBEncoding,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        powerPreference: "low-power",
      }}
      performance={{ min: 0.5, max: 1 }}
    >
      <ambientLight intensity={0.5} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x222222}
        intensity={0.7}
      />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-white">Loading Venus…</div>
          </Html>
        }
      >
        <Venus />
        <SpaceBackground
          isRotating={isRotatingBG}
          isRotatingSetter={setIsRotatingBG}
        />
      </Suspense>
    </Canvas>
  );
}
