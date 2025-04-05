import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const InclinedPlane = () => {
  const planeRef = useRef();
  const objectRef = useRef();
  const scene = useThree((state) => state.scene);
  const angle = 20;
  const rad = THREE.MathUtils.degToRad(angle);
  const startX = 0;
  const startY = 0;

  const objectWidth = 1;
  const objectHeight = 1;
  const objectLength = 1;

  useEffect(() => {
    if (!objectRef.current) return;
    const forceGroup = new THREE.Group();
    const origin = objectRef.current.position.clone();

    const offset = 0.2;

    const gravityVector = new THREE.Vector3(0, -1, 0);
    const gravityArrow = new THREE.ArrowHelper(
      gravityVector,
      origin,
      2,
      "#ff0000"
    );
    forceGroup.add(gravityArrow);

    const normalVector = new THREE.Vector3(
      Math.sin(rad),
      Math.cos(rad),
      0
    ).normalize();
    const normalArrow = new THREE.ArrowHelper(
      normalVector,
      origin.clone().add(new THREE.Vector3(-offset, -0.4, 0)), // ușor în dreapta
      2,
      "#00ff00"
    );
    forceGroup.add(normalArrow);

    const frictionVector = new THREE.Vector3(
      -Math.cos(rad),
      Math.sin(rad),
      0
    ).normalize();
    const frictionArrow = new THREE.ArrowHelper(
      frictionVector,
      origin.clone().add(new THREE.Vector3(-offset, -0.35, 0)), // ușor în stânga
      2,
      "#0000ff"
    );
    forceGroup.add(frictionArrow);

    scene.add(forceGroup);
    return () => scene.remove(forceGroup);
  }, [scene, rad]);

  return (
    <>
      <mesh ref={planeRef} rotation={[0, 0, -rad]} position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.06, 3]} />
        <meshStandardMaterial
          color="#000000"
          opacity={0.6}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      <mesh
        ref={objectRef}
        position={[startX, startY + objectHeight / 2, 0]}
        rotation={[0, 0, -rad]}
      >
        <boxGeometry args={[objectWidth, objectHeight, objectLength]} />
        <meshStandardMaterial
          color="#ff6347"
          opacity={0.6}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      <Text
        position={[-1.5, 1, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.45}
        color="#0000ff"
      >
        Ff
      </Text>

      <Text
        position={[0.3, -1.2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.45}
        color="#ff0000"
      >
        G
      </Text>

      <Text
        position={[0.1, 2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.45}
        color="#00aa00"
      >
        N
      </Text>
    </>
  );
};

const InclinedPlaneScene = () => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);
  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [3, 2, 5], fov: 80 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#ffffff" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <OrbitControls enablePan={false} />

        <InclinedPlane />

        <ForestBackground2
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
        />
      </Canvas>
    </div>
  );
};

export default InclinedPlaneScene;
