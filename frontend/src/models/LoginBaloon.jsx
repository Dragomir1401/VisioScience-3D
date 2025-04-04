import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSpring, a } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import baloonScene from "../assets/3d/baloon.glb";

const LoginBaloon = ({
  isTyping,
  loginClicked,
  setLoginClicked,
  position = [0, -1, 0],
  scale = [2.5, 2.5, 2.5],
}) => {
  const { scene } = useGLTF(baloonScene);
  const [toggleTyping, setToggleTyping] = useState(false);
  const prevIsTyping = useRef(isTyping);

  const [springProps, api] = useSpring(() => ({
    position,
    rotation: [0, 0, 0],
    scale,
    config: { tension: 100, friction: 14 },
  }));

  useEffect(() => {
    if (loginClicked) {
      api.start({
        position: [position[0], position[1] + 1.5, position[2]],
        rotation: [0, Math.PI * 3, 0],
        scale: scale.map((s) => s * 1.3),
        config: { tension: 200, friction: 20, duration: 2000 },
        onRest: () => {
          setLoginClicked(false);
        },
      });
    } else if (isTyping !== prevIsTyping.current) {
      const offsetY = toggleTyping ? 0.15 : -0.15;
      setToggleTyping(!toggleTyping);

      api.start({
        position: [position[0], position[1] + offsetY, position[2]],
        rotation: [0, 0, 0],
        scale: scale.map((s) => s * 1.03),
        config: { tension: 120, friction: 14, duration: 650 },
        onRest: () => {
          api.start({
            position,
            rotation: [0, 3 * offsetY, 0],
            scale,
            config: { tension: 120, friction: 14, duration: 650 },
          });
        },
      });
    } else {
      // Idle animation
      api.start({
        position: [position[0], position[1] + 0.1, position[2]],
        rotation: [0, 0, 0],
        scale,
        loop: { reverse: true },
        config: { duration: 2000 },
      });
    }

    prevIsTyping.current = isTyping;
  }, [isTyping, loginClicked]);

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

export default LoginBaloon;
