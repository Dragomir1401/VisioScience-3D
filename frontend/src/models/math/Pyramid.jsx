import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground from "../ForestBackground";

const Pyramid = () => {
  const pyramidRef = useRef();
  const arrowGroupRef = useRef();
  const scene = useThree((state) => state.scene);

  const baseLength = 1.5;
  const height = 1.2;
  const lateral = Math.sqrt((baseLength / 2) ** 2 + height ** 2);

  useEffect(() => {
    const arrowGroup = new THREE.Group();

    const arrowLength = 0.0;
    const arrowHeadLength = 0.1;
    const arrowHeadWidth = 0.08;

    const yOffset = -0.6;
    const zOffset = 0.55;

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(-baseLength / 2, yOffset, 0),
        0.72 * baseLength,
        "#ff0000",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    const lineGeometryHeight = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, yOffset, 0),
      new THREE.Vector3(0, yOffset + height, 0),
    ]);
    const lineMaterialHeight = new THREE.LineBasicMaterial({
      color: "#0000ff",
    });
    const lineHeight = new THREE.Line(lineGeometryHeight, lineMaterialHeight);
    arrowGroup.add(lineHeight);

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, yOffset, 0),
        height,
        "#0000ff",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    const lineGeometryLateral = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-baseLength / 2, yOffset, 0),
      new THREE.Vector3(0, yOffset + height, 0),
    ]);
    const lineMaterialLateral = new THREE.LineBasicMaterial({
      color: "#00aa00",
    });
    const lineLateral = new THREE.Line(
      lineGeometryLateral,
      lineMaterialLateral
    );
    arrowGroup.add(lineLateral);

    arrowGroup.add(
      new THREE.ArrowHelper(
        new THREE.Vector3(0.5, 0.85, 0),
        new THREE.Vector3(-baseLength / 2, yOffset, 0),
        lateral,
        "#00aa00",
        arrowHeadLength,
        arrowHeadWidth
      )
    );

    arrowGroupRef.current = arrowGroup;
    scene.add(arrowGroup);

    return () => scene.remove(arrowGroup);
  }, [scene]);

  useFrame(() => {
    if (pyramidRef.current && arrowGroupRef.current) {
      arrowGroupRef.current.position.copy(pyramidRef.current.position);
      arrowGroupRef.current.rotation.copy(pyramidRef.current.rotation);
    }
  });

  return (
    <>
      <mesh ref={pyramidRef} rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <coneGeometry args={[baseLength / 2, height, 4]} />
        <meshStandardMaterial
          color="#D27D2D"
          opacity={0.7}
          transparent={true}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <Text position={[0.05, -0.55, 0.8]} fontSize={0.15} color="#ff0000">
        L
      </Text>
      arrowGroup.add(
      <Text position={[0.15, 0.55, 0]} fontSize={0.15} color="#0000ff">
        h
      </Text>
      arrowGroup.add(
      <Text position={[-0.2, 0.5, 0]} fontSize={0.15} color="#00aa00">
        l
      </Text>
      ); );
    </>
  );
};

const PyramidScene = () => {
  const [isRotatingBackground, setIsRotatingBackgroundSetter] = useState(false);

  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.1} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} castShadow />
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
          isRotatingBackground={isRotatingBackground}
          isRotatingBackgroundSetter={setIsRotatingBackgroundSetter}
        />
        <Pyramid />
      </Canvas>
    </div>
  );
};

export default PyramidScene;
