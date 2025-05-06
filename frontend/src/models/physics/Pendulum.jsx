import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const Pendulum = ({ sliderValue = 0 }) => {
  const scene = useThree((state) => state.scene);

  const pivotY = 4;
  const length = 4;
  const bobRadius = 0.5;

  const theta = THREE.MathUtils.degToRad(sliderValue);
  const bobX = length * Math.sin(theta);
  const bobY = pivotY - length + bobRadius;

  const lenGn = 2;
  const lenTg = 2;
  const lenG = lenGn;
  const lenT = 3;

  const dirG = new THREE.Vector3(0, -1, 0);
  const dirT = new THREE.Vector3(-bobX, pivotY - bobY, 0).normalize();
  const weight = new THREE.Vector3(0, -1, 0);
  const dot = weight.dot(dirT);
  const dirGn = dirT.clone().multiplyScalar(dot);
  const dirTg = weight.clone().sub(dirGn).normalize();

  const labelOffset = 0.3;
  const posG = [
    bobX + dirG.x * (lenG + labelOffset),
    bobY + dirG.y * (lenG + labelOffset),
    0,
  ];
  const posT = [
    bobX + dirT.x * (lenT + labelOffset),
    bobY + dirT.y * (lenT + labelOffset),
    0,
  ];
  const posGn = [
    bobX + dirGn.x * (lenGn + labelOffset),
    bobY + dirGn.y * (lenGn + labelOffset),
    0,
  ];
  const posTg = [
    bobX + dirTg.x * (lenTg + labelOffset),
    bobY + dirTg.y * (lenTg + labelOffset),
    0,
  ];

  const [forceGroup, setForceGroup] = useState(null);
  useEffect(() => {
    if (forceGroup) scene.remove(forceGroup);
    const group = new THREE.Group();
    const origin = new THREE.Vector3(bobX, bobY, 0);
    const addArrow = (dir, len, color) => {
      const arrow = new THREE.ArrowHelper(
        dir.normalize(),
        origin,
        len,
        color,
        0.25,
        0.15
      );
      group.add(arrow);
    };

    addArrow(dirG, lenG, "#ff0000");
    addArrow(dirT, lenT, "#ffaa00");

    if (Math.abs(sliderValue) > 0) {
      addArrow(dirGn, lenGn, "#00ff00");
      addArrow(dirTg, lenTg, "#0000ff");
    }

    scene.add(group);
    setForceGroup(group);
    return () => scene.remove(group);
  }, [bobX, bobY, sliderValue]);

  const lineRef = useRef();
  useFrame(() => {
    if (!lineRef.current) return;
    const arr = lineRef.current.array;
    arr[0] = 0;
    arr[1] = pivotY;
    arr[2] = 0;
    arr[3] = bobX;
    arr[4] = bobY;
    arr[5] = 0;
    lineRef.current.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, pivotY + 0.5, 0]}>
        <boxGeometry args={[3, 0.3, 0.3]} />
        <meshStandardMaterial color="#777" />
      </mesh>
      <mesh position={[0, pivotY + 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 32]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      <mesh position={[0, pivotY, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            ref={lineRef}
            attach="attributes-position"
            array={new Float32Array(6)}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444" />
      </lineSegments>

      <mesh position={[bobX, bobY, 0]}>
        <sphereGeometry args={[bobRadius, 16, 16]} />
        <meshStandardMaterial color="#00aaff" />
      </mesh>

      <Text position={posG} fontSize={0.35} color="#ff0000">
        G
      </Text>
      <Text position={posT} fontSize={0.35} color="#ffaa00">
        T
      </Text>
      {Math.abs(sliderValue) > 0 && (
        <>
          <Text position={posGn} fontSize={0.35} color="#00ff00">
            Gn
          </Text>
          <Text position={posTg} fontSize={0.35} color="#0000ff">
            Tg
          </Text>
        </>
      )}
    </>
  );
};

export default function PendulumScene({ sliderValue = 0 }) {
  const [isRotating, setIsRotating] = useState(false);
  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded shadow-md">
        <span className="block text-sm font-medium text-gray-700 text-center">
          Unghi pendul (°)
        </span>
        <input
          type="range"
          min={-60}
          max={60}
          step={1}
          value={sliderValue}
          readOnly
          className="w-48 accent-purple-600 bg-purple-200/40 rounded-lg h-2 cursor-pointer transition-all"
        />
      </div>

      <Canvas camera={{ position: [0, 2.5, 10], fov: 70 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <spotLight position={[0, 5, 0]} angle={0.5} intensity={1} />
        <OrbitControls enablePan={false} />

        <Pendulum sliderValue={sliderValue} />
        <ForestBackground2
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />
      </Canvas>
    </div>
  );
}
