import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a } from "@react-spring/three";
import ForestBackgroundScene from "../assets/3d/sky_swamp.glb";

const ForestBackground3 = ({
  isRotatingForestBackground,
  isRotatingForestBackgroundSetter,
}) => {
  const ForestBackgroundRef = useRef();
  const { nodes, materials } = useGLTF(ForestBackgroundScene);
  const { gl, viewport } = useThree();
  const lastMouseX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;
  const alfa = 0.0075;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingForestBackgroundSetter(true);
    lastMouseX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingForestBackgroundSetter(false);
  };

  const handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isRotatingForestBackground) {
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaMove = (currentX - lastMouseX.current) / viewport.width;

      lastMouseX.current = currentX;
      ForestBackgroundRef.current.rotation.y += deltaMove * alfa * Math.PI;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      if (!isRotatingForestBackground) {
        isRotatingForestBackgroundSetter(true);
        ForestBackgroundRef.current.rotation.y += alfa * Math.PI;
      }
    } else if (e.key === "ArrowLeft") {
      if (!isRotatingForestBackground) {
        isRotatingForestBackgroundSetter(true);
        ForestBackgroundRef.current.rotation.y -= alfa * Math.PI;
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      isRotatingForestBackgroundSetter(false);
    }
  };

  const rotateBackground = (rotation) => {
    const normalizedRotation =
      ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    switch (true) {
      case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
        break;
      case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
        break;
      case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
        break;
      case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
        break;
    }
  };

  useFrame(() => {
    if (!isRotatingForestBackground) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      ForestBackgroundRef.current.rotation.y += rotationSpeed.current;
    } else {
      rotateBackground(ForestBackgroundRef.current.rotation.y);
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl, handleMouseDown, handleMouseUp, handleMouseMove]);

  return (
    <a.group ref={ForestBackgroundRef}>
      <group scale={0.01}>
      <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere003_4_0.geometry}
          material={materials.material_2}
          position={[-2500, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={5000.001}
        />
      </group>
    </a.group>
  );
};

export default ForestBackground3;
