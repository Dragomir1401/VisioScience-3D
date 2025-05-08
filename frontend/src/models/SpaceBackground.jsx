import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a } from "@react-spring/three";
import BackgroundScene from "../assets/3d/space.glb";

const SpaceBackground = ({ isRotating, isRotatingSetter }) => {
  const BackgroundRef = useRef();
  const { nodes, materials } = useGLTF(BackgroundScene);
  const { gl, viewport } = useThree();
  const lastMouseX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;
  const alfa = 0.0075;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingSetter(true);
    lastMouseX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingSetter(false);
  };

  const handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isRotating) {
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaMove = (currentX - lastMouseX.current) / viewport.width;

      lastMouseX.current = currentX;
      BackgroundRef.current.rotation.y += deltaMove * alfa * Math.PI;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      if (!isRotating) {
        isRotatingSetter(true);
        BackgroundRef.current.rotation.y += alfa * Math.PI;
      }
    } else if (e.key === "ArrowLeft") {
      if (!isRotating) {
        isRotatingSetter(true);
        BackgroundRef.current.rotation.y -= alfa * Math.PI;
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      isRotatingSetter(false);
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
    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      BackgroundRef.current.rotation.y += rotationSpeed.current;
    } else {
      rotateBackground(BackgroundRef.current.rotation.y);
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
    <a.group ref={BackgroundRef}>
      <group scale={0.01}>
        <mesh
          receiveShadow
          geometry={nodes.Sphere__0.geometry}
          material={materials["Scene_-_Root"]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={50000}
        />
      </group>
    </a.group>
  );
};

export default SpaceBackground;
