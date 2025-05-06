import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const g = 9.8;

function ProjectileVisualization({ t }) {
  const scene = useThree((state) => state.scene);
  const group = useRef();
  const arrows = useRef(new THREE.Group());

  const v0 = 12;
  const launchAngle = (45 * Math.PI) / 180;
  const v0x = v0 * Math.cos(launchAngle);
  const v0y = v0 * Math.sin(launchAngle);

  const x0 = -6;

  useEffect(() => {
    group.current.add(arrows.current);
    return () => {
      scene.remove(arrows.current);
    };
  }, [scene]);

  useFrame(() => {
    arrows.current.clear();

    const x = x0 + v0x * t;
    const yRaw = v0y * t - 0.5 * g * t * t;
    const y = Math.max(0, yRaw);

    group.current.position.set(x, y, 0);

    const vx = v0x;
    const vy = v0y - g * t;
    const speed = Math.hypot(vx, vy);
    const velDir = new THREE.Vector3(vx, vy, 0).normalize();

    const origin = new THREE.Vector3(0, 0, 0);
    const scale = 0.2;

    arrows.current.add(
      new THREE.ArrowHelper(velDir, origin, speed * scale, 0x0000ff, 0.2, 0.1)
    );

    const dirX = new THREE.Vector3(Math.sign(vx), 0, 0);
    arrows.current.add(
      new THREE.ArrowHelper(
        dirX,
        origin,
        Math.abs(vx) * scale,
        0x00ff00,
        0.2,
        0.1
      )
    );

    const dirY = new THREE.Vector3(0, Math.sign(vy), 0);
    arrows.current.add(
      new THREE.ArrowHelper(
        dirY,
        origin,
        Math.abs(vy) * scale,
        0xffa500,
        0.2,
        0.1
      )
    );

    arrows.current.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        origin,
        1.5,
        0xff0000,
        0.2,
        0.1
      )
    );
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>

      <Text position={[0.3, 0.1, 0]} fontSize={0.2} color="#0000ff">
        v
      </Text>
      <Text
        position={[Math.sign(v0x) * Math.abs(v0x) * 0.2 + 0.3, 0.1, 0]}
        fontSize={0.2}
        color="#00ff00"
      >
        vx
      </Text>
      <Text
        position={[
          0.1,
          Math.sign(v0y - g * t) * Math.abs(v0y - g * t) * 0.2 + 0.3,
          0,
        ]}
        fontSize={0.2}
        color="#ffa500"
      >
        vy
      </Text>
      <Text position={[-0.2, -0.3, 0]} fontSize={0.2} color="#ff0000">
        mg
      </Text>
    </group>
  );
}

export default function ProjectileScene({ time = 0 }) {
  const [isRotating, setIsRotating] = React.useState(false);

  return (
    <Canvas camera={{ position: [0, 4, 14], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <OrbitControls enablePan={false} />

      <mesh rotation={[Math.PI, 0, 0]} position={[1.5, 0.1, 0]}>
        <boxGeometry args={[14, 0.2, 6]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      <ProjectileVisualization t={time} />

      <ForestBackground2
        isRotatingForestBackground={isRotating}
        isRotatingForestBackgroundSetter={setIsRotating}
      />
    </Canvas>
  );
}
