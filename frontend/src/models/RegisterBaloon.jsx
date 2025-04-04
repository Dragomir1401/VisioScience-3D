import React, { useEffect, useRef } from "react";
import { useSpring, a } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import baloonScene from "../assets/3d/baloon.glb";

const RegisterBaloon = ({
  isTyping,
  registerClicked,
  setRegisterClicked,
  position = [0, -1, 0],
  scale = [2.5, 2.5, 2.5],
}) => {
  const { scene } = useGLTF(baloonScene);
  const initialPosition = useRef(position);

  const [springProps, api] = useSpring(() => ({
    position,
    rotation: [0, 0, 0],
    scale,
    config: { tension: 100, friction: 14 },
  }));

  useEffect(() => {
    if (registerClicked) {
      api.start({
        position: [position[0] + 0.5, position[1] + 0.5, position[2]],
        rotation: [Math.PI * 2, Math.PI * 4, Math.PI],
        scale: scale.map((s) => s * 0.2),
        config: { tension: 300, friction: 10, duration: 4000 },
        onRest: () => {
          api.start({
            position: initialPosition.current,
            rotation: [0, 0, 0],
            scale,
            config: { tension: 180, friction: 15, duration: 4000 },
          });
          setRegisterClicked(false);
        },
      });
    } else if (isTyping) {
      api.start({
        position: [position[0], position[1] + 0.2, position[2]],
        rotation: [0, 0.2, 0],
        scale: scale.map((s) => s * 1.1),
        config: { tension: 120, friction: 14, duration: 300 },
      });
    } else {
      api.start({
        position: initialPosition.current,
        rotation: [0, 0, 0],
        scale,
        config: { tension: 100, friction: 14, duration: 1500 },
      });
    }
  }, [isTyping, registerClicked]);

  return (
    <a.mesh
      position={springProps.position}
      rotation={springProps.rotation}
      scale={springProps.scale}
    >
      <primitive object={scene} />
    </a.mesh>
  );
};

export default RegisterBaloon;
