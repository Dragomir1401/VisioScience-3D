import React, { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import baloonScene from "../assets/3d/baloon.glb";

const Baloon = (props) => {
  const { scene } = useGLTF(baloonScene);
  const [animationState, setAnimationState] = useState("idle");

  useEffect(() => {
    const interval = setInterval(() => {
      const states = [
        "idle",
        "swayLeft",
        "swayRight",
        "tiltForward",
        "tiltBackward",
        "floatUp",
        "floatDown",
      ];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setAnimationState(randomState);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const { position, rotation } = useSpring({
    position:
      animationState === "floatUp"
        ? [props.position[0], props.position[1] + 0.3, props.position[2]]
        : animationState === "floatDown"
        ? [props.position[0], props.position[1] - 0.3, props.position[2]]
        : props.position,
    rotation:
      animationState === "swayLeft"
        ? [props.rotation[0], props.rotation[1] - 0.1, props.rotation[2]]
        : animationState === "swayRight"
        ? [props.rotation[0], props.rotation[1] + 0.1, props.rotation[2]]
        : animationState === "tiltForward"
        ? [props.rotation[0] + 0.1, props.rotation[1], props.rotation[2]]
        : animationState === "tiltBackward"
        ? [props.rotation[0] - 0.1, props.rotation[1], props.rotation[2]]
        : props.rotation,
    config: { mass: 1, tension: 100, friction: 85, duration: 2000 },
  });

  return (
    <a.mesh position={position} rotation={rotation} scale={props.scale}>
      <primitive object={scene} />
    </a.mesh>
  );
};

export default Baloon;
