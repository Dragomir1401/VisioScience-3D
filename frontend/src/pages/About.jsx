import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import AboutBaloon from "../models/AboutBaloon";
import Loader from "../components/Loader";

const About = () => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleHover = (value) => {
    setHovered(value);
  };

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-gradient">
      <div className="flex w-full max-w-7xl mx-4 space-x-10">
        <div className="flex-1 relative">
          <Canvas
            camera={{ fov: 50, near: 0.1, far: 1000, position: [0, 0, 6] }}
            className="absolute w-full h-full"
          >
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[1, 2, 1]} intensity={3} />
              <AboutBaloon
                position={[0, -1.7, 1.4]}
                scale={[1, 1, 1]}
                clicked={clicked}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="flex-1 bg-white p-8 rounded-xl shadow-md max-w-lg space-y-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#690375] text-center font-poppins">
            Despre Platforma VisioScience3D
          </h2>

          <p className="text-lg text-gray-700">
            VisioScience3D este o platformă educațională inovativă care oferă
            simulări interactive 3D pentru subiectele științifice, inclusiv
            matematică, fizică, chimie și astronomie. Permite studenților să
            exploreze concepte complexe într-un mod vizual și intuitiv.
          </p>

          <p className="text-lg text-gray-600">
            Această platformă este realizată cu scopul de a ajuta elevii și
            studenții să înțeleagă și să aplice concepte științifice prin
            simulări 3D interactive. Platforma este ușor de utilizat și oferă o
            experiență de învățare captivantă și informativă.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
