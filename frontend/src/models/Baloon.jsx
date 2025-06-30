import React, { useEffect, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import baloonScene from "../assets/3d/baloon.glb";

const Baloon = (props) => {
  const { scene } = useGLTF(baloonScene);
  const [animationState, setAnimationState] = useState("idle");
  const animationTimeout = useRef();

  const scheduleRandomAnimation = () => {
    clearTimeout(animationTimeout.current);
    animationTimeout.current = setTimeout(() => {
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
    }, 3000 + Math.random() * 2000);
  };

  useEffect(() => {
    if (animationState !== "jump") {
      scheduleRandomAnimation();
    }
    return () => clearTimeout(animationTimeout.current);
  }, [animationState]);

  const { position, rotation, scale } = useSpring({
    position:
      animationState === "floatUp"
        ? [props.position[0], props.position[1] + 0.3, props.position[2]]
        : animationState === "floatDown"
        ? [props.position[0], props.position[1] - 0.3, props.position[2]]
        : animationState === "jump"
        ? [props.position[0], props.position[1] + 0.6, props.position[2]]
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
        : animationState === "jump"
        ? [props.rotation[0] + 0.1, props.rotation[1], props.rotation[2] - 0.2]
        : props.rotation,
    scale:
      animationState === "jump"
        ? [props.scale[0] * 1.15, props.scale[1] * 1.15, props.scale[2] * 1.15]
        : props.scale,
    config:
      animationState === "jump"
        ? { mass: 1, tension: 500, friction: 30 }
        : { mass: 2, tension: 100, friction: 85, duration: 2500 },
    onRest: () => {
      if (animationState === "jump") {
        setAnimationState("idle");
      }
    },
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (animationState !== "jump") {
      setAnimationState("jump");
    }
  };

  return (
    <a.mesh
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
    >
      <primitive object={scene} />
    </a.mesh>
  );
};

export default Baloon;
