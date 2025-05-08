import { useSpring, a } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import baloonScene from "../assets/3d/baloon.glb";

const ContactBaloon = ({ position = [0, -2, 0], scale = [2, 2, 2] }) => {
  const { scene } = useGLTF(baloonScene);
  const [springProps, api] = useSpring(() => ({
    position,
    rotation: [0, 0, 0],
    scale,
    config: { tension: 100, friction: 14 },
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      api.start({
        scale: [scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1],
        config: { tension: 120, friction: 14 },
      });
      setTimeout(() => {
        api.start({
          scale: scale,
          config: { tension: 120, friction: 14 },
        });
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [scale, api]);

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

export default ContactBaloon;
