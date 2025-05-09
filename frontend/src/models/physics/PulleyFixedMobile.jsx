import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const PulleyFixedMobileSystem = ({ sliderValue }) => {
  const scene = useThree((state) => state.scene);

  const fixedPulleyY = 4;
  const fixedPulleyRadius = 0.6;

  const mY = -sliderValue;
  const negMY = -mY;

  const mobilePulleyRadius = 0.5;
  const mobilePulleyY = mY + 0.6;

  const [forceGroup, setForceGroup] = useState(null);

  useEffect(() => {
    if (forceGroup) scene.remove(forceGroup);
    const group = new THREE.Group();

    const addArrow = (dir, origin, length, color, name) => {
      const arrow = new THREE.ArrowHelper(
        dir.normalize(),
        origin,
        length,
        color,
        0.25,
        0.15
      );
      arrow.name = name || "";
      group.add(arrow);
    };

    const g = new THREE.Vector3(0, -1, 0);
    const t2 = new THREE.Vector3(0, 1, 0);
    const F = new THREE.Vector3(0, -1, 0);

    const mPos = new THREE.Vector3(0, mY - 3, 0);

    addArrow(g, mPos, 1.2, "#ff0000", "G");

    addArrow(
      t2,
      mPos.clone().add(new THREE.Vector3(0.05, 0.5, 0)),
      1.0,
      "#ffaa00",
      "T2"
    );

    addArrow(
      new THREE.Vector3(0, -1, 0),
      mPos.clone().add(new THREE.Vector3(0.05, 3.1, 0)),
      1.0,
      "#ffaa00",
      "T2"
    );

    addArrow(
      new THREE.Vector3(0, 1, 0),
      mPos.clone().add(new THREE.Vector3(-0.55, 3.8, 0)),
      1.0,
      "#ff6800",
      "T1"
    );

    addArrow(
      new THREE.Vector3(0, 1, 0),
      mPos.clone().add(new THREE.Vector3(0.6, 3.8, 0)),
      1.0,
      "#ff6800",
      "T1"
    );

    addArrow(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(-1.65, fixedPulleyY, 0),
      1.0,
      "#ff6800",
      "T1"
    );

    addArrow(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-1.65, negMY + 1.3, 0),
      1.0,
      "#ff6800",
      "T1"
    );

    addArrow(F, new THREE.Vector3(-1.6, negMY + 1.34, 0), 1, "#00ffcc", "Fa");

    scene.add(group);
    setForceGroup(group);

    return () => scene.remove(group);
  }, [sliderValue]);

  const leftFixedX = -fixedPulleyRadius;

  const rightFixedX = fixedPulleyRadius;
  const leftMobileX = -mobilePulleyRadius;
  const rightMobileX = mobilePulleyRadius;

  const ropeStartX = -1.2;
  const ropeStartY = fixedPulleyY + 0.3;
  const cableRef = useRef();

  useFrame(() => {
    const arr = cableRef.current.array;

    arr[0] = ropeStartX - 0.4;
    arr[1] = ropeStartY;
    arr[2] = 0;
    arr[3] = ropeStartX - 0.4;
    arr[4] = negMY + ropeStartY - 3;
    arr[5] = 0;

    arr[6] = rightFixedX - 1;
    arr[7] = fixedPulleyY;
    arr[8] = 0;
    arr[9] = leftMobileX;
    arr[10] = mobilePulleyY;
    arr[11] = 0;

    arr[12] = rightMobileX;
    arr[13] = mobilePulleyY;
    arr[14] = 0;
    arr[15] = rightFixedX;
    arr[16] = fixedPulleyY + 1;
    arr[17] = 0;

    arr[18] = 0;
    arr[19] = mobilePulleyY;
    arr[20] = 0;
    arr[21] = 0;
    arr[22] = mY - 2.5;
    arr[23] = 0;

    cableRef.current.needsUpdate = true;
  });

  return (
    <>
      {/* Suport fix (tavan) */}
      <mesh position={[0, fixedPulleyY + 1.0, 0]}>
        <boxGeometry args={[4, 0.2, 0.5]} />
        <meshStandardMaterial color="#777" />
      </mesh>

      {/* Suport fix */}
      <mesh position={[-1, 4.8, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 32]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Scripete fix */}
      <mesh position={[-1, fixedPulleyY, 0]}>
        <torusGeometry args={[fixedPulleyRadius, 0.06, 16, 100]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Scripete mobil */}
      <mesh position={[0, mobilePulleyY, 0]}>
        <torusGeometry args={[mobilePulleyRadius, 0.06, 16, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Cabluri */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            ref={cableRef}
            attach="attributes-position"
            array={new Float32Array(24)}
            count={8}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444" />
      </lineSegments>

      {/* Corpul m */}
      <mesh position={[0, mY - 3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffaa00" transparent opacity={0.85} />
      </mesh>

      {/* Etichete */}
      <Text position={[0, mY - 4.4, 0]} fontSize={0.4} color="#ff0000">
        G
      </Text>
      <Text position={[0.4, mY - 0.5, 0]} fontSize={0.4} color="#ffaa00">
        T2
      </Text>
      <Text position={[0.4, mY - 1.9, 0]} fontSize={0.4} color="#ffaa00">
        T2
      </Text>
      <Text position={[-2, fixedPulleyY - 1, 0]} fontSize={0.4} color="#ff6800">
        T1
      </Text>
      <Text position={[-2, negMY + 2, 0]} fontSize={0.4} color="#ff6800">
        T1
      </Text>
      <Text position={[-0.85, mY + 1.7, 0]} fontSize={0.4} color="#ff6800">
        T1
      </Text>
      <Text position={[0.85, mY + 1.7, 0]} fontSize={0.4} color="#ff6800">
        T1
      </Text>
      <Text position={[-1.4, negMY + 0.2, 0]} fontSize={0.4} color="#00ffcc">
        Fa
      </Text>
    </>
  );
};

const PulleyFixedMobileScene = ({ sliderValue }) => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded shadow-md">
        <span className="block text-sm font-medium text-gray-700 text-center">
          Poziție masă
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

      <Canvas camera={{ position: [0, 2.5, 8], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <spotLight position={[0, 5, 0]} angle={0.5} intensity={1} />
        <OrbitControls enablePan={false} />

        <PulleyFixedMobileSystem sliderValue={sliderValue} />

        <ForestBackground2
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
        />
      </Canvas>
    </div>
  );
};

export default PulleyFixedMobileScene;
