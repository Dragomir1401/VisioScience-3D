import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const CircularMotionVisualization = ({ speed }) => {
  const scene = useThree((state) => state.scene);
  const arrows = useRef(new THREE.Group());
  const lineRef = useRef();
  const groupRef = useRef();
  const angle = useRef(0);

  const radius = 3;
  const massRadius = 0.3;
  const g = 9.8;

  useEffect(() => {
    scene.add(arrows.current);
    return () => void scene.remove(arrows.current);
  }, [scene]);

  useFrame((_, dt) => {
    angle.current += (speed / radius) * dt;

    const x = radius * Math.cos(angle.current);
    const z = radius * Math.sin(angle.current);

    groupRef.current.position.set(x, 0, z);

    lineRef.current.geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x, 0, z),
    ]);

    arrows.current.clear();
    const Fc = (speed * speed) / radius;
    const inward = new THREE.Vector3(-x, 0, -z).normalize();
    const outward = inward.clone().negate();
    const gravity = new THREE.Vector3(0, -1, 0);
    const scale = 0.075;
    const origin = new THREE.Vector3(x, 0, z);

    arrows.current.add(
      new THREE.ArrowHelper(inward, origin, Fc * scale, 0x0000ff, 0.2, 0.1)
    );
    arrows.current.add(
      new THREE.ArrowHelper(outward, origin, Fc * scale, 0xffa500, 0.2, 0.1)
    );
    arrows.current.add(
      new THREE.ArrowHelper(gravity, origin, g * scale * 3, 0xff0000, 0.2, 0.1)
    );
  });

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <line ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#000" linewidth={1} />
      </line>

      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[massRadius, 16, 16]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        <Text position={[0, -0.8, 0]} fontSize={0.3} color="#ff0000">
          Fg
        </Text>
        <Text position={[-0.5, -0.2, 0]} fontSize={0.3} color="#0000ff">
          Fc
        </Text>
        <Text position={[0.4, 0.2, 0]} fontSize={0.3} color="#ffa500">
          Fcf
        </Text>
      </group>
    </>
  );
};

export default function CircularMotionScene({ speed = 0 }) {
  const [isRotating, setIsRotating] = useState(false);

  return (
    <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls enablePan enableZoom enableRotate />

      <CircularMotionVisualization speed={speed} />

      <ForestBackground2
        isRotatingForestBackground={isRotating}
        isRotatingForestBackgroundSetter={setIsRotating}
      />
    </Canvas>
  );
}
