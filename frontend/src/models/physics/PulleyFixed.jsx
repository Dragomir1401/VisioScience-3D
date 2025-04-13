import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const PulleySystem = ({ sliderValue }) => {
  const scene = useThree((state) => state.scene);
  const pulleyRadius = 0.9;
  const pulleyY = 4;

  const m1Y = sliderValue;
  const m2Y = -sliderValue;

  const [forceGroup, setForceGroup] = useState(null);

  const cablePositionsRef = useRef();

  useFrame(() => {
    if (cablePositionsRef.current) {
      const pos = cablePositionsRef.current.array;

      // stânga
      pos[0] = -0.9;
      pos[1] = m1Y + 0.4;
      pos[2] = 0;
      pos[3] = -pulleyRadius;
      pos[4] = pulleyY + 0.3;
      pos[5] = 0;

      // dreapta
      pos[6] = 0.9;
      pos[7] = m2Y + 0.4;
      pos[8] = 0;
      pos[9] = pulleyRadius;
      pos[10] = pulleyY + 0.3;
      pos[11] = 0;

      cablePositionsRef.current.needsUpdate = true;
    }
  });

  useEffect(() => {
    if (forceGroup) scene.remove(forceGroup);
    const group = new THREE.Group();

    const addArrow = (dir, origin, length, color) => {
      const arrow = new THREE.ArrowHelper(
        dir.normalize(),
        origin,
        length,
        color,
        0.25,
        0.15
      );
      group.add(arrow);
    };

    const g = new THREE.Vector3(0, -1, 0);
    const t = new THREE.Vector3(0, 1, 0);

    const m1Pos = new THREE.Vector3(-0.9, m1Y, 0);
    const m2Pos = new THREE.Vector3(0.9, m2Y, 0);

    // Forțe gravitaționale
    addArrow(g, m1Pos, 1.2, "#ff0000"); // G1
    addArrow(g, m2Pos, 1.2, "#ff0000"); // G2

    // Tensiune în corpurile 1 și 2
    addArrow(
      t,
      m1Pos.clone().add(new THREE.Vector3(-0.05, 0.4, 0)),
      0.9,
      "#ffaa00"
    );
    addArrow(
      t,
      m2Pos.clone().add(new THREE.Vector3(0.05, 0.4, 0)),
      0.9,
      "#ffaa00"
    );

    // Forță activă aplicată masei care coboară (cea mai jos poziționată)
    const isM1Lower = m1Y < m2Y;
    const faPos = isM1Lower ? m1Pos : m2Pos;
    addArrow(
      g,
      faPos.clone().add(new THREE.Vector3(0.1, -0.4, 0)),
      2,
      "#00ffcc"
    );

    // Tensiune în scripete
    const leftT = new THREE.Vector3(0, -1, 0).normalize();
    const rightT = new THREE.Vector3(0, -1, 0).normalize();
    addArrow(
      leftT,
      new THREE.Vector3(-pulleyRadius - 0.1, pulleyY, 0),
      0.9,
      "#ffaa00"
    );
    addArrow(
      rightT,
      new THREE.Vector3(pulleyRadius + 0.1, pulleyY, 0),
      0.9,
      "#ffaa00"
    );

    scene.add(group);
    setForceGroup(group);

    return () => scene.remove(group);
  }, [sliderValue]);

  return (
    <>
      {/* Suport fix (tavan) */}
      <mesh position={[0, 6.5, 0]}>
        <boxGeometry args={[2, 0.2, 0.5]} />
        <meshStandardMaterial color="#777" />
      </mesh>

      {/* Suport fix */}
      <mesh position={[0, pulleyY + 1.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 32]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Scripete */}
      <mesh position={[0, pulleyY, 0]}>
        <torusGeometry args={[0.9, 0.07, 16, 100]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Cabluri */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            ref={cablePositionsRef}
            attach="attributes-position"
            array={new Float32Array(12)} // 4 puncte * 3 coordonate
            count={4}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444" />
      </lineSegments>

      {/* Blocuri */}
      <mesh position={[-0.9, m1Y, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#00aaff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.9, m2Y, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#ffaa00" transparent opacity={0.85} />
      </mesh>

      {/* Etichete G și T pe corpuri */}
      <Text position={[-0.9, m1Y - 1.3, 0]} fontSize={0.4} color="#ff0000">
        G
      </Text>
      <Text position={[-0.5, m1Y + 1.1, 0]} fontSize={0.4} color="#ffaa00">
        T
      </Text>

      <Text position={[0.9, m2Y - 1.3, 0]} fontSize={0.4} color="#ff0000">
        G
      </Text>
      <Text position={[0.5, m2Y + 1.1, 0]} fontSize={0.4} color="#ffaa00">
        T
      </Text>

      {/* Etichete T în scripete */}
      <Text position={[-1.2, pulleyY - 0.6, 0]} fontSize={0.4} color="#ffaa00">
        T
      </Text>
      <Text position={[1.2, pulleyY - 0.6, 0]} fontSize={0.4} color="#ffaa00">
        T
      </Text>
      <Text
        position={[m1Y < m2Y ? -1.1 : 1.3, (m1Y < m2Y ? m1Y : m2Y) - 2, 0]}
        fontSize={0.4}
        color="#00ffcc"
      >
        Fa
      </Text>
    </>
  );
};

const PulleyScene = ({ sliderValue }) => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);
  return (
  <div className="w-full h-[600px] relative">
    <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded shadow-md">
      <span className="block text-sm font-medium text-gray-700 text-center">
        Poziție mase
      </span>
      <input
        type="range"
        min={-2}
        max={2}
        step={0.01}
        value={sliderValue}
        readOnly
        className="w-48 accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
      />
    </div>

    <Canvas camera={{ position: [0, 2.5, 8.5], fov: 75 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <spotLight position={[0, 5, 0]} angle={0.5} intensity={1} />
      <OrbitControls enablePan={false} />
      <PulleySystem sliderValue={sliderValue} />
      <ForestBackground2 
        isRotatingForestBackground={isRotatingForestBackground}
        isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
      />
    </Canvas>
  </div>
  )
};

export default PulleyScene;
