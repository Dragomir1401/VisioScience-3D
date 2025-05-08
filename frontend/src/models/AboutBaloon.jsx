import { useSpring, a } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import baloonScene from "../assets/3d/baloon.glb";

const AboutBaloon = ({ position = [0, -2, 0], scale = [2, 2, 2] }) => {
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
        position: [
          position[0],
          position[1] + (Math.random() * 0.2 - 0.1),
          position[2],
        ],
        rotation: [0, (Math.random() * Math.PI) / 10, 0],
        config: { tension: 120, friction: 44 },
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [position, api]);

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

export default AboutBaloon;
