import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { a } from "@react-spring/three";
import droneScene from "../assets/3d/drone.glb";

const Drone = ({
  radiusX = 8,
  radiusZ = 5,
  centerY = 10,
  offset = 0,
  speed = 1,
  tiltAmplitude = 0.03,
  propellerSpeed = 5,
  basePosition = [0, 0, 0],
  ...props
}) => {
  const droneRef = useRef();
  const propeller1Ref = useRef();
  const propeller2Ref = useRef();
  const propeller3Ref = useRef();
  const propeller4Ref = useRef();
  const { nodes, materials } = useGLTF(droneScene);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;

    const x = basePosition[0] + radiusX * Math.cos(t + offset);
    const z = basePosition[2] + radiusZ * Math.sin(t + offset);
    const y = basePosition[1] + centerY + Math.sin(t * 2) * 0.2;

    droneRef.current.position.set(x, y, z);
    droneRef.current.rotation.y = -(t + offset);
    droneRef.current.rotation.x = tiltAmplitude * Math.sin(t * 1.5);

    propeller1Ref.current.rotation.y = t * propellerSpeed;
    propeller2Ref.current.rotation.y = t * propellerSpeed;
    propeller3Ref.current.rotation.y = t * propellerSpeed;
    propeller4Ref.current.rotation.y = t * propellerSpeed;
  });

  return (
    <a.group ref={droneRef} {...props}>
      <group position={[0, -0.02, 0]} rotation={[-0.244, 1.071, 0.72]}>
        <mesh
          geometry={nodes.Object_0007.geometry}
          material={materials["Pano_Light.004"]}
        />
        <mesh
          geometry={nodes.Object_0007_1.geometry}
          material={materials["Pano.004"]}
        />
      </group>
      <mesh
        ref={propeller1Ref}
        geometry={nodes.Object_4003.geometry}
        material={materials["Fundo.005"]}
        position={[-0.684, 0.292, 0.997]}
        rotation={[3.018, -0.57, 0.489]}
      />
      <mesh
        ref={propeller2Ref}
        geometry={nodes.Object_4002.geometry}
        material={materials["Fundo.001"]}
        position={[0.723, 0.292, 1.002]}
        rotation={[3.018, -0.17, 0.489]}
      />
      <mesh
        ref={propeller3Ref}
        geometry={nodes.Object_4004.geometry}
        material={materials["Fundo.002"]}
        position={[0.731, 0.292, -0.977]}
        rotation={[3.018, -0.17, 0.489]}
      />
      <mesh
        ref={propeller4Ref}
        geometry={nodes.Object_4005.geometry}
        material={materials["Fundo.003"]}
        position={[-0.676, 0.292, -0.986]}
        rotation={[3.018, -0.17, 0.489]}
      />
    </a.group>
  );
};

export default Drone;
