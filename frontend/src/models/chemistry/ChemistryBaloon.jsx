import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import baloonScene from "../../assets/3d/baloon.glb";

export default function ChemistryBaloon({ isTyping, uploadSuccess, position = [0, 0, 0], scale = [0.4, 0.4, 0.4] }) {
  const { scene } = useGLTF(baloonScene);
  const baloonRef = useRef();

  useFrame((state, delta) => {
    if (!baloonRef.current) return;

    if (uploadSuccess) {
      baloonRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 6) * 0.2;
      baloonRef.current.rotation.y += delta * 0.1;
    } else if (isTyping) {
      baloonRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    } else {
      baloonRef.current.position.y = position[1];
      baloonRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={baloonRef} position={position} scale={scale}>
      <primitive object={scene} />
    </mesh>
  );
}
