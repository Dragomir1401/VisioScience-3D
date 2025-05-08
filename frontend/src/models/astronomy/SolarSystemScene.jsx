import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";

import skyTexture from "../../assets/textures/solar_system/Milky-Way-panorama_4000.jpg";
import sunTexture from "../../assets/textures/solar_system/SunMap.jpg";
import sunFire from "../../assets/textures/solar_system/SunFire.jpg";
import mercuryMap from "../../assets/textures/solar_system/mercury.jpg";
import venusMap from "../../assets/textures/solar_system/Venus.jpg";
import earthMap from "../../assets/textures/solar_system/Earth Map.jpg";
import earthCloudsMap from "../../assets/textures/solar_system/Earth-Clouds2700.jpg";
import marsMap from "../../assets/textures/solar_system/mars.jpg";
import jupiterMap from "../../assets/textures/solar_system/Jupitar.jpg";
import saturnMap from "../../assets/textures/solar_system/saturn.jpg";
import saturnRingsMap from "../../assets/textures/solar_system/SaturnRings.jpg";
import uranusMap from "../../assets/textures/solar_system/uranus.jpg";
import uranusRingsMap from "../../assets/textures/solar_system/UranusRings.jpg";
import neptuneMap from "../../assets/textures/solar_system/neptune.jpg";
import plutoMap from "../../assets/textures/solar_system/pluto.jpg";

function Skydome() {
  const [map] = useTexture([skyTexture]);
  map.encoding = THREE.sRGBEncoding;
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={map} side={THREE.BackSide} />
    </mesh>
  );
}

function Sun() {
  const ref = useRef();
  const [map, fire] = useTexture([sunTexture, sunFire]);
  map.encoding = fire.encoding = THREE.sRGBEncoding;

  useFrame((_, dt) => {
    ref.current.rotation.y += 0.05 * dt;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial
        map={map}
        emissiveMap={fire}
        emissive={0xffffff}
        toneMapped={false}
      />
    </mesh>
  );
}

function Planet({
  texture,
  size,
  distance,
  orbitSpeed,
  rotationSpeed,
  tilt = 0,
  children,
}) {
  const pivot = useRef();
  const mesh = useRef();
  const [map] = useTexture([texture]);
  map.encoding = THREE.sRGBEncoding;

  useFrame((_, dt) => {
    pivot.current.rotation.y += orbitSpeed * dt;
    mesh.current.rotation.y += rotationSpeed * dt;
  });

  return (
    <group ref={pivot}>
      <mesh ref={mesh} position={[distance, 0, 0]} rotation={[tilt, 0, 0]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={map} />
      </mesh>
      {children}
    </group>
  );
}

function EarthClouds({ size }) {
  const [map] = useTexture([earthCloudsMap]);
  map.encoding = THREE.sRGBEncoding;
  return (
    <mesh>
      <sphereGeometry args={[size + 0.02, 32, 32]} />
      <meshPhongMaterial
        map={map}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

function Ring({ innerR, outerR, texture, tilt = 0 }) {
  const [map] = useTexture([texture]);
  map.encoding = THREE.sRGBEncoding;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 1);

  return (
    <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 128]} />
      <meshStandardMaterial
        map={map}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function SolarSystemScene() {
  const scale = 2.5;
  return (
    <Canvas
      camera={{ position: [0, 20, 50], fov: 45 }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        outputEncoding: THREE.sRGBEncoding,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={2.4} />
      <pointLight position={[0, 0, 0]} intensity={2.8} />

      <OrbitControls />

      <Suspense
        fallback={
          <Html center>
            <div style={{ color: "white" }}>Loading Solar System…</div>
          </Html>
        }
      >
        <Skydome />
        <Sun />

        <Planet
          texture={mercuryMap}
          size={0.5}
          distance={8}
          orbitSpeed={0.08 * scale}
          rotationSpeed={0.006 * scale}
        />

        <Planet
          texture={venusMap}
          size={0.9}
          distance={11}
          orbitSpeed={0.06 * scale}
          rotationSpeed={0.0025 * scale}
          tilt={0.02}
        />

        <Planet
          texture={earthMap}
          size={1}
          distance={14}
          orbitSpeed={0.04 * scale}
          rotationSpeed={0.05 * scale}
          tilt={0.41}
        >
          <EarthClouds size={1} />
        </Planet>

        <Planet
          texture={marsMap}
          size={0.7}
          distance={17}
          orbitSpeed={0.03 * scale}
          rotationSpeed={0.04 * scale}
        />

        <Planet
          texture={jupiterMap}
          size={2}
          distance={22}
          orbitSpeed={0.02 * scale}
          rotationSpeed={0.1 * scale}
        />

        <Planet
          texture={saturnMap}
          size={1.7}
          distance={28}
          orbitSpeed={0.015 * scale}
          rotationSpeed={0.08 * scale}
          tilt={0.13}
        >
          <Ring innerR={2} outerR={3} texture={saturnRingsMap} tilt={0.13} />
        </Planet>

        <Planet
          texture={uranusMap}
          size={1.4}
          distance={34}
          orbitSpeed={0.01 * scale}
          rotationSpeed={0.07 * scale}
          tilt={0.77}
        >
          <Ring
            innerR={1.6}
            outerR={2.4}
            texture={uranusRingsMap}
            tilt={0.77}
          />
        </Planet>

        <Planet
          texture={neptuneMap}
          size={1.3}
          distance={40}
          orbitSpeed={0.008 * scale}
          rotationSpeed={0.06 * scale}
          tilt={0.41}
        />

        <Planet
          texture={plutoMap}
          size={0.4}
          distance={44}
          orbitSpeed={0.005 * scale}
          rotationSpeed={0.03 * scale}
        />
      </Suspense>
    </Canvas>
  );
}
