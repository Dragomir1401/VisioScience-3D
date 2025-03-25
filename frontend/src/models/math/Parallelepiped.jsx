import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground from "../ForestBackground";

const Parallelepiped = () => {
  const shapeRef = useRef();
  const arrowGroupRef = useRef();
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const arrowGroup = new THREE.Group();

    const arrowLength = 0.0;
    const arrowHeadLength = 0.1;
    const arrowHeadWidth = 0.08;

    const yOffset = 0.6;
    const zOffset = 0.6;

    const lineGeometryL = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.5, yOffset, zOffset),
      new THREE.Vector3(1.5, yOffset, zOffset),
    ]);
    const lineMaterialL = new THREE.LineBasicMaterial({ color: "#ff0000" });
    const lineL = new THREE.Line(lineGeometryL, lineMaterialL);
    arrowGroup.add(lineL);

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(-1.5, 0, 0),
        new THREE.Vector3(-1.5, yOffset, zOffset),
        arrowLength,
        "#ff0000",
        arrowHeadLength,
        arrowHeadWidth
      )
    );
    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(1.5, 0, 0),
        new THREE.Vector3(1.5, yOffset, zOffset),
        arrowLength,
        "#ff0000",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    // l arrow (width - green)
    const lineGeometryl = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.5, yOffset, 1),
      new THREE.Vector3(-0.5, yOffset, -1),
    ]);
    const lineMateriall = new THREE.LineBasicMaterial({ color: "#00aa00" });
    const linel = new THREE.Line(lineGeometryl, lineMateriall);
    arrowGroup.add(linel);

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-0.5, yOffset, -1),
        arrowLength,
        "#00aa00",
        arrowHeadLength,
        arrowHeadWidth
      )
    );
    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-0.5, yOffset, 1),
        arrowLength,
        "#00aa00",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    // h arrow (height - blue)
    const lineGeometryH = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.6, -0.5, 0.5),
      new THREE.Vector3(1.6, 0.5, 0.5),
    ]);
    const lineMaterialH = new THREE.LineBasicMaterial({ color: "#0000ff" });
    const lineH = new THREE.Line(lineGeometryH, lineMaterialH);
    arrowGroup.add(lineH);

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1.6, 0.5, 0.5),
        arrowLength,
        "#0000ff",
        arrowHeadLength,
        arrowHeadWidth
      )
    );
    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(1.6, -0.5, 0.5),
        arrowLength,
        "#0000ff",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    arrowGroupRef.current = arrowGroup;
    scene.add(arrowGroup);

    return () => scene.remove(arrowGroup);
  }, [scene]);

  useFrame(() => {
    if (shapeRef.current && arrowGroupRef.current) {
      arrowGroupRef.current.position.copy(shapeRef.current.position);
      arrowGroupRef.current.rotation.copy(shapeRef.current.rotation);
    }
  });

  return (
    <>
      <mesh ref={shapeRef} rotation={[0, 0, 0]} position={[0, 0.25, 0]}>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial
          color="#D27D2D"
          opacity={0.5}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      <Text
        position={[0, 1.1, 0.6]}
        rotation={[0, 0, 0]}
        fontSize={0.35}
        color="#ff0000"
      >
        L
      </Text>
      <Text
        position={[-0.4, 1.1, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.35}
        color="#00aa00"
      >
        l
      </Text>
      <Text
        position={[1.8, 0.3, 0.5]}
        rotation={[0, 0, 0]}
        fontSize={0.35}
        color="#0000ff"
      >
        h
      </Text>
    </>
  );
};

const ParallelepipedScene = () => {
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

        <Parallelepiped />
      </Canvas>
    </div>
  );
};

export default ParallelepipedScene;
