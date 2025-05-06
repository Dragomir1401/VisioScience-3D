import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const RADIUS = 0.5;
const BOUND = 10 - RADIUS;

function CollisionVisualization({ onInit }) {
  const scene = useThree((state) => state.scene);
  const pos1 = useRef(-3);
  const pos2 = useRef(3);
  const vel1 = useRef(1.5);
  const vel2 = useRef(-1.0);
  const collided = useRef(false);

  const mesh1 = useRef();
  const mesh2 = useRef();
  const arrows1 = useRef(new THREE.Group());
  const arrows2 = useRef(new THREE.Group());

  const [label1, setLabel1] = useState(vel1.current.toFixed(2));
  const [label2, setLabel2] = useState(vel2.current.toFixed(2));

  useEffect(() => {
    scene.add(arrows1.current, arrows2.current);
    onInit?.({ pos1, pos2, vel1, vel2, collided });
    return () => scene.remove(arrows1.current, arrows2.current);
  }, [scene, onInit]);

  useFrame((_, delta) => {
    if (!collided.current) {
      const next1 = pos1.current + vel1.current * delta;
      const next2 = pos2.current + vel2.current * delta;

      if (next2 - next1 <= 2 * RADIUS) {
        const mid = (next1 + next2) / 2;
        pos1.current = mid - RADIUS;
        pos2.current = mid + RADIUS;
        const oldV1 = vel1.current;
        vel1.current = vel2.current;
        vel2.current = oldV1;
        collided.current = true;
      } else {
        pos1.current = next1;
        pos2.current = next2;
      }
    } else {
      pos1.current += vel1.current * delta;
      pos2.current += vel2.current * delta;
    }

    if (pos1.current >= BOUND) {
      pos1.current = BOUND;
      vel1.current = 0;
    }
    if (pos1.current <= -BOUND) {
      pos1.current = -BOUND;
      vel1.current = 0;
    }
    if (pos2.current >= BOUND) {
      pos2.current = BOUND;
      vel2.current = 0;
    }
    if (pos2.current <= -BOUND) {
      pos2.current = -BOUND;
      vel2.current = 0;
    }

    mesh1.current.position.x = pos1.current;
    mesh2.current.position.x = pos2.current;

    arrows1.current.clear();
    arrows2.current.clear();
    const scale = 1.0;
    if (vel1.current !== 0) {
      arrows1.current.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(Math.sign(vel1.current), 0, 0),
          new THREE.Vector3(pos1.current, 0, 0),
          Math.abs(vel1.current) * scale,
          0x0000ff,
          0.2,
          0.1
        )
      );
    }
    if (vel2.current !== 0) {
      arrows2.current.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(Math.sign(vel2.current), 0, 0),
          new THREE.Vector3(pos2.current, 0, 0),
          Math.abs(vel2.current) * scale,
          0x0000ff,
          0.2,
          0.1
        )
      );
    }

    setLabel1(vel1.current.toFixed(2));
    setLabel2(vel2.current.toFixed(2));
  });

  return (
    <>
      <group ref={mesh1}>
        <mesh>
          <sphereGeometry args={[RADIUS, 32, 32]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          m1
        </Text>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="#0000ff"
          anchorX="center"
          anchorY="middle"
        >
          v1 = {label1}
        </Text>
      </group>

      <group ref={mesh2}>
        <mesh>
          <sphereGeometry args={[RADIUS, 32, 32]} />
          <meshStandardMaterial color="#e44f46" />
        </mesh>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          m2
        </Text>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="#0000ff"
          anchorX="center"
          anchorY="middle"
        >
          v2 = {label2}
        </Text>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RADIUS, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </>
  );
}

export default function ElasticCollisionScene() {
  const [isRotating, setIsRotating] = useState(false);
  const paramsRef = useRef();

  const handleInit = (refs) => {
    paramsRef.current = refs;
  };

  const handleReset = () => {
    const { pos1, pos2, vel1, vel2, collided } = paramsRef.current;
    pos1.current = -3;
    pos2.current = 3;
    vel1.current = 1.5;
    vel2.current = -1.0;
    collided.current = false;
  };

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls enablePan={false} enableZoom={false} />

        <CollisionVisualization onInit={handleInit} />
        <ForestBackground2
          isRotatingForestBackground={isRotating}
          isRotatingForestBackgroundSetter={setIsRotating}
        />
      </Canvas>

      <button
        onClick={handleReset}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                   bg-gradient-to-r from-mulberry to-pink-500
                   hover:from-pink-600 hover:to-mulberry text-white
                   py-2 px-4 rounded-lg shadow-lg"
      >
        Reset
      </button>
    </div>
  );
}
