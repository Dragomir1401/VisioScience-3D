import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Loader from "../components/Loader";
import Island from "../models/Island";
import Background from "../models/Background";
import Ballon from "../models/Baloon";
import Drone from "../models/drone";
import Popup from "../components/Popup";

function Scene3D({ setSceneLoaded, ...props }) {
  useEffect(() => {
    setSceneLoaded(true);
  }, [setSceneLoaded]);

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
          <hemisphereLight
            skyColor="0xb1e1ff"
            groundColor="0xb1e1ff"
            intensity={1}
          />

          <Island
            isRotatingIsland={isRotatingIsland}
            isRotatingIslandSetter={isRotatingIslandSetter}
            currentStageSetter={currentStageSetter}
            position={islandPosition}
            rotation={islandRotation}
            scale={islandScale}
          />
          <Background
            isRotatingBackground={isRotatingBackground}
            isRotatingBackgroundSetter={isRotatingBackgroundSetter}
          />
          <Ballon
            isRotatingIsland={isRotatingIsland}
            scale={baloonScale}
            position={baloonPosition}
            rotation={baloonRotation}
          />
          <Drone
            radiusX={18}
            radiusZ={12}
            centerY={3}
            offset={3}
            speed={0.2}
            propellerSpeed={480}
            tiltAmplitude={0.85}
            basePosition={[0, -11, -50]}
          />
          <Drone
            radiusX={3}
            radiusZ={16}
            centerY={5}
            offset={17}
            speed={0.5}
            propellerSpeed={520}
            tiltAmplitude={0.25}
            basePosition={[2, -10, -60]}
          />
    </>
  );
}


const Acasa = () => {
  const PositionIslandInCanvas = () => {
    let canvasScale = null;
    let canvasPosition = [-7, -28, -65];
    let canvasRotation = [-0.02, 1.52, 0.0];

    if (window.innerWidth < 768) {
      canvasScale = [0.85, 0.85, 0.85];
    } else {
      canvasScale = [0.9, 0.9, 0.9];
    }

    return [canvasScale, canvasPosition, canvasRotation];
  };

  const PositionBaloonInCanvas = () => {
    let canvasScale = null;
    let canvasPosition = [0.2, -7.5, 0.4];
    let canvasRotation = [-0.02, 1.52, 0.08];

    if (window.innerWidth < 768) {
      canvasScale = [0.7, 0.7, 0.7];
    } else {
      canvasScale = [0.9, 0.9, 0.9];
    }

    return [canvasScale, canvasPosition, canvasRotation];
  };

  const [currentStage, currentStageSetter] = useState(1);
  const [isRotatingIsland, isRotatingIslandSetter] = useState(false);
  const [isRotatingBackground, isRotatingBackgroundSetter] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  const [islandScale, islandPosition, islandRotation] =
    PositionIslandInCanvas();

  const [baloonScale, baloonPosition, baloonRotation] =
    PositionBaloonInCanvas();

  return (
    <section className="w-full h-screen relative flex items-center justify-center">
      <div className="absolute top-28 left-0 right-0 z-50 flex items-center justify-center">
        {sceneLoaded && currentStage && (
        <div className="absolute top-28 left-0 right-0 z-50 flex items-center justify-center">
          <Popup currentStage={currentStage} />
        </div>
      )}
      </div>
      <Canvas
        className={`w-full h-screen bg-transparent ${
          (isRotatingIsland ? "cursor-grabbing" : "cursor-grab",
          isRotatingBackground ? "cursor-grabbing" : "cursor-grab")
        }`}
        camera={{ fov: 40, near: 0.8, far: 1000, position: [0, 8, 20] }}
      >
        <Suspense fallback={<Loader />}>
          <Scene3D
            setSceneLoaded={setSceneLoaded}
            isRotatingIsland={isRotatingIsland}
            isRotatingIslandSetter={isRotatingIslandSetter}
            isRotatingBackground={isRotatingBackground}
            isRotatingBackgroundSetter={isRotatingBackgroundSetter}
            currentStage={currentStage}
            currentStageSetter={currentStageSetter}
            islandPosition={islandPosition}
            islandRotation={islandRotation}
            islandScale={islandScale}
            baloonPosition={baloonPosition}
            baloonRotation={baloonRotation}
            baloonScale={baloonScale}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Acasa;
