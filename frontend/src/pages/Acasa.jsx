import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Loader from "../components/Loader";
import Island from "../models/Island";

const Acasa = () => {
  const PositionIslandInCanvas = () => {
    let canvasScale = null;
    let canvasPosition = [0, -5.95, -46];
    let canvasRotation = [0.05, 1.32, 0];

    if (window.innerWidth < 768) {
      canvasScale = [0.9, 0.9, 0.9];
    } else {
      canvasScale = [1, 1, 1];
    }

    return [canvasScale, canvasPosition, canvasRotation];
  };

  const [islandScale, islandPosition, islandRotation] =
    PositionIslandInCanvas();

  return (
    <section className="w-full h-screen relative flex items-center justify-center">
      <div className="absolute top-28 left-0 right-0 z-0 flex items-center justify-center">
        {/* POPUP */}
      </div>

      <Canvas
        className="w-full h-screen bg-transparent"
        camera={{ near: 0.1, far: 1000, position: [0, 0, 5] }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight />
          <ambientLight />
          <pointLight />
          <spotLight />
          <hemisphereLight />

          <Island
            scale={islandScale}
            position={islandPosition}
            rotation={islandRotation}
          />
        </Suspense>
      </Canvas>
    </section>
  );
};

export default Acasa;
