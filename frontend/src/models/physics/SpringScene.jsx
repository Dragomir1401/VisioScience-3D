// src/models/physics/SpringScene.jsx
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const SpringMass = ({ displacement = 0 }) => {
  const scene = useThree((state) => state.scene);
  const pivotY = 4;
  const restLength = 3;
  const massRadius = 0.4;
  const k = 2;

  const endY = pivotY - restLength - displacement;
  const massY = endY - massRadius;
  const restY = pivotY - restLength;

  const Fg = 1.5;
  const Fe = k * displacement;
  const Fa = Fe;

  const [arrowGroup, setArrowGroup] = useState(null);

  useEffect(() => {
    if (arrowGroup) scene.remove(arrowGroup);
    const group = new THREE.Group();

    const makeArrow = (dir, origin, len, color) =>
      new THREE.ArrowHelper(
        dir.clone().normalize(),
        origin,
        len,
        color,
        0.2,
        0.1
      );

    const origin = new THREE.Vector3(0, massY, 0);
    group.add(makeArrow(new THREE.Vector3(0, -1, 0), origin, Fg, "#ff0000"));
    group.add(makeArrow(new THREE.Vector3(0, 1, 0), origin, Fe, "#00ccff"));
    group.add(makeArrow(new THREE.Vector3(0, -1, 0), origin, Fa, "#ffaa00"));

    const deltaLen = Math.abs(displacement);
    const top = new THREE.Vector3(2, restY, 0);
    const bottom = new THREE.Vector3(2, endY, 0);
    group.add(makeArrow(new THREE.Vector3(0, -1, 0), top, deltaLen, "#444"));
    group.add(makeArrow(new THREE.Vector3(0, 1, 0), bottom, deltaLen, "#444"));

    scene.add(group);
    setArrowGroup(group);
    return () => scene.remove(group);
  }, [massY, restY, endY, displacement, Fg, Fe, Fa, scene, arrowGroup]);

  const springRef = useRef();
  useFrame(() => {
    const coils = 8;
    const length = restLength + displacement;
    const step = length / (coils * 2);
    const amplitude = 0.3;
    const points = [];
    for (let i = 0; i <= coils * 2; i++) {
      const x = i % 2 === 0 ? -amplitude : amplitude;
      const y = pivotY - step * i;
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.TubeGeometry(curve, coils * 20, 0.05, 8, false);
    springRef.current.geometry.dispose();
    springRef.current.geometry = tube;
  });

  return (
    <>
      <mesh position={[0, pivotY + 0.2, 0]}>
        <boxGeometry args={[3, 0.3, 0.3]} />
        <meshStandardMaterial color="#777" />
      </mesh>

      <mesh ref={springRef}>
        <tubeGeometry
          args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, pivotY, 0),
              new THREE.Vector3(0, endY, 0),
            ]),
            1,
            0.05,
            8,
            false,
          ]}
        />
        <meshStandardMaterial color="#888" />
      </mesh>

      <mesh position={[0, massY, 0]}>
        <sphereGeometry args={[massRadius, 16, 16]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>

      <Text position={[0, massY - 0.8, 0]} fontSize={0.3} color="#ff0000">
        G
      </Text>
      <Text position={[0, massY + Fe + 0.3, 0]} fontSize={0.3} color="#00ccff">
        Fe
      </Text>
      <Text position={[0, massY - Fa - 0.3, 0]} fontSize={0.3} color="#ffaa00">
        F
      </Text>

      <Text
        position={[2.4, (restY + endY) / 2, 0]}
        fontSize={0.25}
        color="#444"
      >
        Δℓ
      </Text>
    </>
  );
};

export default function SpringMassScene({ extension = 0 }) {
  const [isRotating, setIsRotating] = useState(false);

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded shadow-md">
        <span className="block text-sm font-medium text-gray-700 text-center">
          Deformare arc (m)
        </span>
        <input
          type="range"
          min={-2}
          max={2}
          step={0.01}
          value={extension}
          readOnly
          className="w-48 accent-purple-600 bg-purple-200/40 rounded-lg h-2 cursor-pointer transition-all"
        />
      </div>

      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls enablePan={false} />
        <SpringMass displacement={extension} />
        <ForestBackground2
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />
      </Canvas>
    </div>
  );
}
