import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import backgroundScene from "../assets/3D/sky.glb";

const Background = ({ isRotatingBackground, isRotatingBackgroundSetter }) => {
  const background = useGLTF(backgroundScene);
  const backgroundRef = useRef();
  const { gl, viewport } = useThree();
  const lastMouseX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;
  const alfa = 0.0075;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingBackgroundSetter(true);
    lastMouseX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingBackgroundSetter(false);
  };

  const handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isRotatingBackground) {
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaMove = (currentX - lastMouseX.current) / viewport.width;

      lastMouseX.current = currentX;
      backgroundRef.current.rotation.y += deltaMove * alfa * Math.PI;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      if (!isRotatingBackground) {
        isRotatingBackgroundSetter(true);
        backgroundRef.current.rotation.y += alfa * Math.PI;
      }
    } else if (e.key === "ArrowLeft") {
      if (!isRotatingBackground) {
        isRotatingBackgroundSetter(true);
        backgroundRef.current.rotation.y -= alfa * Math.PI;
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      isRotatingBackgroundSetter(false);
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
    if (!isRotatingBackground) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      backgroundRef.current.rotation.y += rotationSpeed.current;
    } else {
      rotateBackground(backgroundRef.current.rotation.y);
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
    <mesh ref={backgroundRef} position={[0, 0, -100]} scale={[1.5, 1.5, 1.5]}>
      <primitive object={background.scene} />
    </mesh>
  );
};

export default Background;
