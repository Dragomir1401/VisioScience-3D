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
    let canvasPosition = [-7, -17.7, -50];
    let canvasRotation = [-0.02, 1.52, 0.0];

    if (window.innerWidth < 768) {
      canvasScale = [0.9, 0.9, 0.9];
    } else {
      canvasScale = [1, 1, 1];
    }

    return [canvasScale, canvasPosition, canvasRotation];
  };

  const PositionBaloonInCanvas = () => {
    let canvasScale = null;
    let canvasPosition = [0.2, -6.9, -0.6];
    let canvasRotation = [-0.02, 1.52, 0.08];

    if (window.innerWidth < 768) {
      canvasScale = [0.6, 0.6, 0.6];
    } else {
      canvasScale = [0.85, 0.85, 0.85];
    }

    return [canvasScale, canvasPosition, canvasRotation];
  };

  const [currentStage, currentStageSetter] = useState(1);
  const [isRotating, isRotatingSetter] = useState(false);

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
          isRotating ? "cursor-grabbing" : "cursor-grab"
        }`}
        camera={{ fov: 60, near: 0.5, far: 1000, position: [0, 4, 13] }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[1, 1, 1]} intensity={4} />
          <ambientLight intensity={0.7} />
          <hemisphereLight
            skyColor="0xb1e1ff"
            groundColor="0xffb6b6"
            intensity={1}
          />

          <Background />
          <Island
            isRotating={isRotating}
            isRotatingSetter={isRotatingSetter}
            currentStageSetter={currentStageSetter}
            position={islandPosition}
            rotation={islandRotation}
            scale={islandScale}
          />
          <Ballon
            isRotating={isRotating}
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
