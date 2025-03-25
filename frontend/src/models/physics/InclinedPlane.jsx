import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const InclinedPlane = () => {
  const planeRef = useRef();
  const objectRef = useRef();
  const forceArrowRef = useRef();
  const normalArrowRef = useRef();
  const frictionArrowRef = useRef();
  const scene = useThree((state) => state.scene);

  const angle = 30; // angle of the inclined plane
  const objectMass = 1; // mass of the object
  const gravity = 9.8; // gravitational constant

  // Object properties
  const objectWidth = 0.5;
  const objectHeight = 0.5;
  const objectLength = 0.5;

  // Friction and normal force calculations
  const frictionCoefficient = 0.2;
  const normalForce =
    objectMass * gravity * Math.cos(THREE.MathUtils.degToRad(angle));
  const frictionForce = normalForce * frictionCoefficient;
  const componentOfGravityAlongIncline =
    objectMass * gravity * Math.sin(THREE.MathUtils.degToRad(angle));

  useEffect(() => {
    const forceGroup = new THREE.Group();

    // Gravity force (always downward)
    const gravityVector = new THREE.Vector3(
      0,
      -componentOfGravityAlongIncline,
      0
    );
    const gravityArrow = new THREE.ArrowHelper(
      gravityVector,
      new THREE.Vector3(0, 0, 0),
      1,
      "#ff0000"
    );
    forceGroup.add(gravityArrow);

    // Normal force (perpendicular to the surface)
    const normalForceVector = new THREE.Vector3(0, normalForce, 0);
    const normalArrow = new THREE.ArrowHelper(
      normalForceVector,
      new THREE.Vector3(0, 0, 0),
      1,
      "#00ff00"
    );
    forceGroup.add(normalArrow);

    // Friction force (opposite to the direction of motion)
    const frictionForceVector = new THREE.Vector3(0, -frictionForce, 0);
    const frictionArrow = new THREE.ArrowHelper(
      frictionForceVector,
      new THREE.Vector3(0, 0, 0),
      1,
      "#0000ff"
    );
    forceGroup.add(frictionArrow);

    // Add force group to the scene
    scene.add(forceGroup);

    return () => scene.remove(forceGroup);
  }, [scene]);

  useFrame(() => {
    if (objectRef.current) {
      // Simulate the object's movement along the plane
      const speed = componentOfGravityAlongIncline - frictionForce; // Resultant force
      const time = 0.01;
      objectRef.current.position.x += speed * time;
      objectRef.current.position.y =
        0.5 *
        Math.sin(THREE.MathUtils.degToRad(angle)) *
        objectRef.current.position.x;
    }
  });

  return (
    <>
      <mesh
        ref={planeRef}
        rotation={[THREE.MathUtils.degToRad(angle), 0, 0]}
        position={[0, -0.25, 0]}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#9c9c9c" />
      </mesh>

      <mesh ref={objectRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[objectWidth, objectHeight, objectLength]} />
        <meshStandardMaterial color="#ff6347" />
      </mesh>

      <Text position={[0, 1.5, 0]} fontSize={0.25} color="#ff0000">
        Object on Incline Plane
      </Text>
    </>
  );
};

const InclinedPlaneScene = () => {
  const [isRotatingBackground, setIsRotatingBackgroundSetter] = useState(false);

  return (
    <div className="w-full h-[600px]">
      <Canvas camera={{ position: [3, 2, 5], fov: 70 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#ffffff" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <OrbitControls enablePan={false} />

        <InclinedPlane />
      </Canvas>
    </div>
  );
};

export default InclinedPlaneScene;
