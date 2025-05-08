import React, { useRef, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import SpaceBackground from "../SpaceBackground";

import marsColor from "../../assets/textures/mars/mars_1k_color.jpg";
import marsTopo from "../../assets/textures/mars/mars_1k_topo.jpg";

function Mars({ rotationSpeed = 0.01 }) {
  const ref = useRef();
  const [colorMap, heightMap] = useTexture([marsColor, marsTopo]);

  colorMap.encoding = THREE.sRGBEncoding;
  heightMap.encoding = THREE.LinearEncoding;

  useFrame((_, delta) => {
    ref.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <mesh
      ref={ref}
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
        map={colorMap}
        bumpMap={heightMap}
        bumpScale={0.05}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

function CameraLight() {
  const light = useRef();
  const { camera } = useThree();
  useFrame(() => light.current.position.copy(camera.position));
  return <pointLight ref={light} intensity={0.3} />;
}

export default function ThreeMarsScene() {
  const [isRotatingBG, setIsRotatingBG] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      dpr={[1, 1]}
      gl={{ powerPreference: "low-power", outputEncoding: THREE.sRGBEncoding }}
      performance={{ min: 0.5, max: 1 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2.2} />
      <CameraLight />

      <OrbitControls enablePan={false} />

      <Suspense
        fallback={
          <Html center>
            <div className="text-black">Loading Mars…</div>
          </Html>
        }
      >
        <Mars />
        <SpaceBackground
          isRotating={isRotatingBG}
          isRotatingSetter={setIsRotatingBG}
        />
      </Suspense>
    </Canvas>
  );
}
