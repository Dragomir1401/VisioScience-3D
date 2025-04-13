import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Loader from "../components/Loader";
import Island from "../models/Island";
import Background from "../models/Background";
import Ballon from "../models/Baloon";
import Drone from "../models/drone";
import Popup from "../components/Popup";

function Scene3D({ setSceneLoaded, ...props }) {
  useEffect(() => setSceneLoaded(true), [setSceneLoaded]);

  const {
    isRotatingIsland,
    isRotatingIslandSetter,
    isRotatingBackground,
    isRotatingBackgroundSetter,
    currentStage,
    currentStageSetter,
    islandPosition,
    islandRotation,
    islandScale,
    baloonPosition,
    baloonRotation,
    baloonScale,
  } = props;

  return (
    <>
      <directionalLight position={[1, 1, 1]} intensity={4} />
      <ambientLight intensity={0.7} />
      <hemisphereLight skyColor="0xb1e1ff" groundColor="0xb1e1ff" intensity={1} />

      <Island {...{ isRotatingIsland, isRotatingIslandSetter, currentStageSetter, position: islandPosition, rotation: islandRotation, scale: islandScale }} />
      <Background {...{ isRotatingBackground, isRotatingBackgroundSetter }} />
      <Ballon {...{ isRotatingIsland, scale: baloonScale, position: baloonPosition, rotation: baloonRotation }} />
      <Drone radiusX={18} radiusZ={12} centerY={3} offset={3} speed={0.2} propellerSpeed={480} tiltAmplitude={0.85} basePosition={[0, -11, -50]} />
      <Drone radiusX={3} radiusZ={16} centerY={5} offset={17} speed={0.5} propellerSpeed={520} tiltAmplitude={0.25} basePosition={[2, -10, -60]} />
    </>
  );
}

const Acasa = () => {
  const [currentStage, currentStageSetter] = useState(1);
  const [isRotatingIsland, isRotatingIslandSetter] = useState(false);
  const [isRotatingBackground, isRotatingBackgroundSetter] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  const islandScale = window.innerWidth < 768 ? [0.85, 0.85, 0.85] : [0.9, 0.9, 0.9];
  const islandPosition = [-7, -28, -65];
  const islandRotation = [-0.02, 1.52, 0.0];

  const baloonScale = window.innerWidth < 768 ? [0.7, 0.7, 0.7] : [0.9, 0.9, 0.9];
  const baloonPosition = [0.2, -7.5, 0.4];
  const baloonRotation = [-0.02, 1.52, 0.08];

  return (
    <section className="w-full h-screen relative flex items-center justify-center bg-gradient-to-b from-[#fdf4ff] via-[#f3e8ff] to-[#fff7ed]">
      {sceneLoaded && (
        <div className="absolute top-28 left-0 right-0 z-50 flex items-center justify-center">
          <Popup currentStage={currentStage} />
        </div>
      )}
      <Canvas
        className={`w-full h-screen bg-transparent`}
        camera={{ fov: 40, near: 0.8, far: 1000, position: [0, 8, 20] }}
      >
        <Suspense fallback={<Loader />}>
          <Scene3D
            setSceneLoaded={setSceneLoaded}
            {...{
              isRotatingIsland,
              isRotatingIslandSetter,
              isRotatingBackground,
              isRotatingBackgroundSetter,
              currentStage,
              currentStageSetter,
              islandPosition,
              islandRotation,
              islandScale,
              baloonPosition,
              baloonRotation,
              baloonScale,
            }}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Acasa;
