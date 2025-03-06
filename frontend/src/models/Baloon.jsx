import React from "react";
import baloonScene from "../assets/3D/baloon.glb";
import { useGLTF } from "@react-three/drei";

const Baloon = ({ isRotating, ...props }) => {
  const baloon = useGLTF(baloonScene);

  return (
    <mesh {...props}>
      <primitive object={baloon.scene} />
    </mesh>
  );
};

export default Baloon;
