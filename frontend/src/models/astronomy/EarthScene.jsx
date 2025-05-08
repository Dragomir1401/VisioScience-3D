import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import earthAlbedo from "../../assets/textures/earth/earth_albedo.jpg";
import earthBump from "../../assets/textures/earth/earth_bump.jpg";
import earthAO from "../../assets/textures/earth/earth_land_ocean_mask.png";
import earthEmissive from "../../assets/textures/earth/earth_night_lights_modified.png";
import earthClouds from "../../assets/textures/earth/clouds_earth.png";

function Earth({ rotationSpeed = 0.02 }) {
  const meshRef = useRef();
  const [albedo, bump, ao, emissive, clouds] = useTexture([
    earthAlbedo,
    earthBump,
    earthAO,
    earthEmissive,
    earthClouds,
  ]);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[5.05, 32, 32]} />
        <meshStandardMaterial
          map={clouds}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={meshRef}
        onUpdate={(self) => {
          const geo = self.geometry;
          if (!geo.attributes.uv2) {
            geo.setAttribute(
              "uv2",
              new THREE.BufferAttribute(geo.attributes.uv.array, 2)
            );
          }
        }}
      >
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial
          map={albedo}
          normalMap={bump}
          aoMap={ao}
          aoMapIntensity={0.8}
          emissiveMap={emissive}
          emissiveIntensity={0.6}
          metalness={0.15}
          roughness={0.75}
          toneMapped={true}
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
      <ambientLight intensity={3} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0x444444}
        intensity={6}
      />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-black">Loading Earth…</div>
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
