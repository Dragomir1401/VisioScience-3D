import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

function FreeFallVisualization({ t }) {
  const scene = useThree((state) => state.scene);
  const group = useRef();
  const arrows = useRef(new THREE.Group());

  const g = 9.8;
  const y0 = 5;
  const y = Math.max(0, y0 - 0.5 * g * t * t);
  const vy = -g * t;
  const speed = Math.abs(vy);

  useEffect(() => {
    group.current.add(arrows.current);
    return () => void scene.remove(arrows.current);
  }, [scene]);

  useFrame(() => {
    arrows.current.clear();
    group.current.position.set(0, y, 0);

    arrows.current.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 0),
        1.5,
        0xff0000,
        0.2,
        0.1
      )
    );

    arrows.current.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 0),
        speed * 0.2,
        0x0000ff,
        0.2,
        0.1
      )
    );
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
      <Text position={[0.5, 0, 0]} fontSize={0.2} color="#0000ff">
        v
      </Text>
      <Text position={[-0.5, 0, 0]} fontSize={0.2} color="#ff0000">
        mg
      </Text>
    </group>
  );
}

export default function FreeFallScene({ time = 0 }) {
  const [isRotating, setIsRotating] = useState(false);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <OrbitControls enablePan={false} />

      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.35, 0]}>
        <boxGeometry args={[6, 0.1, 6]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      <FreeFallVisualization t={time} />

      <ForestBackground2
        isRotatingForestBackground={isRotating}
        isRotatingForestBackgroundSetter={setIsRotating}
      />
    </Canvas>
  );
}
