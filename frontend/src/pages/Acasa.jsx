import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Loader from "../components/Loader";
import Island from "../models/Island";
import Background from "../models/Background";
import Ballon from "../models/Baloon";
import { useFormState } from "react-dom";

const Acasa = () => {
  const PositionIslandInCanvas = () => {
    let canvasScale = null;
    let canvasPosition = [-7, -20.7, -54];
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
    let canvasPosition = [0.2, -6.2, 1.2];
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

  const [islandScale, islandPosition, islandRotation] =
    PositionIslandInCanvas();

  const [baloonScale, baloonPosition, baloonRotation] =
    PositionBaloonInCanvas();

  return (
    <section className="w-full h-screen relative flex items-center justify-center">
      <div className="absolute top-28 left-0 right-0 z-0 flex items-center justify-center">
        {/* POPUP */}
      </div>

      <Canvas
        className={`w-full h-screen bg-transparent ${
          (isRotatingIsland ? "cursor-grabbing" : "cursor-grab",
          isRotatingBackground ? "cursor-grabbing" : "cursor-grab")
        }`}
        camera={{ fov: 40, near: 0.8, far: 1000, position: [0, 8, 20] }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={4} />
          <ambientLight intensity={0.7} />
          <hemisphereLight
            skyColor="0xb1e1ff"
            groundColor="0xffb6b6"
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
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Acasa;
