import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground from "../ForestBackground";

const Sphere = () => {
  const sphereRef = useRef();
  const arrowGroupRef = useRef();
  const scene = useThree((state) => state.scene);

  const radius = 1;

  useEffect(() => {
    const arrowGroup = new THREE.Group();

    const arrowLength = 0.0;
    const arrowHeadLength = 0.1;
    const arrowHeadWidth = 0.08;

    const yOffset = 0;
    const zOffset = 0.2;

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, yOffset, 0),
      new THREE.Vector3(radius, yOffset, 0),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: "#ff0000" });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    arrowGroup.add(line);

    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, yOffset, 0),
      radius,
      "#ff0000",
      arrowHeadLength,
      arrowHeadWidth
    );
    arrowGroup.add(arrow);

    arrowGroupRef.current = arrowGroup;
    scene.add(arrowGroup);

    return () => scene.remove(arrowGroup);
  }, [scene]);

  useFrame(() => {
    if (sphereRef.current && arrowGroupRef.current) {
      arrowGroupRef.current.position.copy(sphereRef.current.position);
      arrowGroupRef.current.rotation.copy(sphereRef.current.rotation);
    }
  });

  return (
    <>
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color="#D27D2D"
          opacity={0.5}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      <Text
        position={[0.4, 0.2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.35}
        color="#ff0000"
      >
        r
      </Text>
    </>
  );
};

const SphereScene = () => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);

  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [3, 2, 5], fov: 70 }}>
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

        <ForestBackground
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
        />
        <Sphere />
      </Canvas>
    </div>
  );
};

export default SphereScene;
