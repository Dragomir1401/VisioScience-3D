import React from "react";
import { useGLTF } from "@react-three/drei";
import backgroundScene from "../assets/3D/sky.glb";

const Background = () => {
  const background = useGLTF(backgroundScene);
  return (
    <mesh>
      <primitive object={background.scene} />
    </mesh>
  );
};

export default Background;
