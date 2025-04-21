import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const Pendulum = ({ angle }) => {
  const scene = useThree((state) => state.scene);

  const pivotY = 3;
  const length = 2.5;
  const bobRadius = 0.3;
  const g = 9.8;

  const theta = THREE.MathUtils.degToRad(angle);

  const bobX = length * Math.sin(theta);
  const bobY = pivotY - length * Math.cos(theta);

  const [forceGroup, setForceGroup] = useState(null);
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

    const bobPos = new THREE.Vector3(bobX, bobY, 0);

    addArrow(new THREE.Vector3(0, -1, 0), bobPos, 1.5, "#ff0000");

    const tension = new THREE.Vector3(0 - bobX, pivotY - bobY, 0).normalize();
    addArrow(tension, bobPos.clone(), 1.5, "#ffaa00");

    const weight = new THREE.Vector3(0, -1, 0).normalize();
    const radial = tension.clone();

    const dot = weight.dot(radial);
    const tangential = weight
      .clone()
      .sub(radial.clone().multiplyScalar(dot))
      .normalize();

    addArrow(
      radial,
      bobPos.clone().add(new THREE.Vector3(-0.3, 0, 0)),
      1.0,
      "#00ff00"
    );
    addArrow(
      tangential,
      bobPos.clone().add(new THREE.Vector3(0.3, 0, 0)),
      1.0,
      "#0000ff"
    );

    scene.add(group);
    setForceGroup(group);

    return () => scene.remove(group);
  }, [angle]);

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
      {/* Pivot */}
      <mesh position={[0, pivotY, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Fir */}
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

      {/* Bob */}
      <mesh position={[bobX, bobY, 0]}>
        <sphereGeometry args={[bobRadius, 16, 16]} />
        <meshStandardMaterial color="#00aaff" />
      </mesh>

      {/* Etichete (opțional) */}
      <Text position={[bobX, bobY - 0.9, 0]} fontSize={0.3} color="#ff0000">
        G
      </Text>
      <Text
        position={[bobX + 0.4, bobY + 0.3, 0]}
        fontSize={0.3}
        color="#ffaa00"
      >
        T
      </Text>
      <Text
        position={[bobX - 0.6, bobY + 0.3, 0]}
        fontSize={0.3}
        color="#00ff00"
      >
        R
      </Text>
      <Text position={[bobX + 0.6, bobY, 0]} fontSize={0.3} color="#0000ff">
        Tg
      </Text>
    </>
  );
};

const PendulumScene = ({ angle }) => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);
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
          value={angle}
          readOnly
          className="w-48 accent-purple-600 
               bg-purple-200/40 rounded-lg overflow-hidden 
               appearance-none h-2 cursor-pointer 
               transition-all"
        />
      </div>

      <Canvas camera={{ position: [0, 2, 8], fov: 70 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <spotLight position={[0, 5, 0]} angle={0.5} intensity={1} />
        <OrbitControls enablePan={false} />

        <Pendulum angle={angle} />

        <ForestBackground2
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
        />
      </Canvas>
    </div>
  );
};

export default PendulumScene;
