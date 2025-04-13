import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import ForestBackground2 from "../ForestBackground2";

const InclinedPlane = ({ sliderValue }) => {
  const scene = useThree((state) => state.scene);
  const objectRef = useRef();
  const [forceGroup, setForceGroup] = useState(null);
  const angle = 20;
  const rad = THREE.MathUtils.degToRad(angle);
  const heightOffset = 0.511;

  const posX = sliderValue;
  const posY = -(posX * Math.tan(rad)) + heightOffset;
  const sign = sliderValue >= 0 ? -1 : 1;

  useEffect(() => {
    if (!objectRef.current) return;

    if (forceGroup) {
      scene.remove(forceGroup);
    }

    const group = new THREE.Group();
    const origin = new THREE.Vector3(posX, posY, 0);
    const offset = 0.25;

    const gArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      origin,
      2,
      "#ff0000"
    );
    group.add(gArrow);

    const normalDir = new THREE.Vector3(Math.sin(rad), Math.cos(rad), 0);
    const nArrow = new THREE.ArrowHelper(
      normalDir.normalize(),
      origin.clone().add(new THREE.Vector3(-0.2, -0.4, 0)),
      2,
      "#00ff00"
    );
    group.add(nArrow);

    const frictionDir = new THREE.Vector3(
      sign * Math.cos(rad),
      -sign * Math.sin(rad),
      0
    );
    const fArrow = new THREE.ArrowHelper(
      frictionDir.normalize(),
      origin.clone().add(new THREE.Vector3(-offset + 0.1, -0.3, 0)),
      2,
      "#0000ff"
    );
    group.add(fArrow);

    const activeDir = frictionDir.clone().multiplyScalar(-1);
    const aArrow = new THREE.ArrowHelper(
      activeDir.normalize(),
      origin.clone().add(new THREE.Vector3(0, 0, 0)),
      2,
      "#ffaa00"
    );
    group.add(aArrow);

    scene.add(group);
    setForceGroup(group);

    return () => scene.remove(group);
  }, [sliderValue]);

  return (
    <>
      <mesh rotation={[0, 0, -rad]} position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.06, 3]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.6} />
      </mesh>

      <mesh ref={objectRef} position={[posX, posY, 0]} rotation={[0, 0, -rad]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6347" transparent opacity={0.6} />
      </mesh>

      <Text
        position={[posX - 0.3, posY - 1.6, 0]}
        fontSize={0.4}
        color="#ff0000"
      >
        G
      </Text>
      <Text position={[posX, posY + 1.3, 0]} fontSize={0.4} color="#00aa00">
        N
      </Text>
      <Text
        position={
          sign === -1 ? [posX - 2, posY + 0.7, 0] : [posX + 1.8, posY - 0.3, 0]
        }
        fontSize={0.4}
        color="#0000ff"
      >
        Ff
      </Text>
      <Text
        position={
          sign === -1 ? [posX + 1.8, posY - 0.3, 0] : [posX - 2, posY + 0.7, 0]
        }
        fontSize={0.4}
        color="#ffaa00"
      >
        Fa
      </Text>
    </>
  );
};

const InclinedPlaneScene = ({ sliderValue }) => {
  const [isRotatingForestBackground, isRotatingForestBackgroundSetter] =
    useState(false);

  return (
    <div className="w-full h-[600px] relative">
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded shadow-md">
        <span className="block text-sm font-medium text-gray-700 text-center">
          Poziție pe plan
        </span>
        <input
          type="range"
          min={-4}
          max={4}
          step={0.01}
          value={sliderValue}
          readOnly
          className="w-full max-w-lg accent-purple-600 
               bg-purple-200/40 rounded-lg overflow-hidden 
               appearance-none h-2 cursor-pointer 
               transition-all"
        />
      </div>

      <Canvas camera={{ position: [3, 2, 5], fov: 80 }}>
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
        <InclinedPlane sliderValue={sliderValue} />
        <ForestBackground2
          isRotatingForestBackground={isRotatingForestBackground}
          isRotatingForestBackgroundSetter={isRotatingForestBackgroundSetter}
         />
      </Canvas>
    </div>
  );
};

export default InclinedPlaneScene;
