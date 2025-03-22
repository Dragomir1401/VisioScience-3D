import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground from "../ForestBackground";

const Cube = () => {
  const cubeRef = useRef();
  const arrowGroupRef = useRef();
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const arrowGroup = new THREE.Group();

    const arrowLength = 0.0;
    const arrowHeadLength = 0.1;
    const arrowHeadWidth = 0.08;

    const yOffset = 0.8;
    const zOffset = 0.8;

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.75, yOffset, zOffset),
      new THREE.Vector3(0.75, yOffset, zOffset),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: "#ff0000" });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    arrowGroup.add(line);

    const arrowLeft = new THREE.ArrowHelper(
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(-0.75, yOffset, zOffset),
      arrowLength,
      "#ff0000",
      arrowHeadLength,
      arrowHeadWidth
    );
    arrowGroup.add(arrowLeft);

    const arrowRight = new THREE.ArrowHelper(
      new THREE.Vector3(1.5, 0, 0),
      new THREE.Vector3(0.75, yOffset, zOffset),
      arrowLength,
      "#ff0000",
      arrowHeadLength,
      arrowHeadWidth
    );
    arrowGroup.add(arrowRight);

    arrowGroupRef.current = arrowGroup;
    scene.add(arrowGroup);

    return () => scene.remove(arrowGroup);
  }, [scene]);

  useFrame(() => {
    if (cubeRef.current && arrowGroupRef.current) {
      arrowGroupRef.current.position.copy(cubeRef.current.position);
      arrowGroupRef.current.rotation.copy(cubeRef.current.rotation);
    }
  });

  return (
    <>
      <mesh ref={cubeRef} rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color="#8ecae6"
          opacity={0.6}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      <Text
        position={[0, 1, 0.8]}
        rotation={[0, 0, 0]}
        fontSize={0.25}
        color="#ff0000"
      >
        L
      </Text>
    </>
  );
};

const CubeScene = () => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);

  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [3, 2, 5], fov: 70 }}>
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#ffffff" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <OrbitControls enablePan={false} />

        <ForestBackground
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
        />

        <Cube />
      </Canvas>
    </div>
  );
};

export default CubeScene;
