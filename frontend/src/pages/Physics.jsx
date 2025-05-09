import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import PhysicsLanding from "../components/physics/PhysicsLanding";
import InclinedPlaneScene from "../models/physics/InclinedPlane";
import Pulley2Scene from "../models/physics/PulleyFixed";
import Pulley3Scene from "../models/physics/PulleyFixedMobile";
import PendulumScene from "../models/physics/Pendulum";
import SpringMassScene from "../models/physics/SpringScene";
import CircularMotionScene from "../models/physics/CircularMotionScene";
import ProjectileScene from "../models/physics/ProjectileScene";
import FreeFallScene from "../models/physics/FreeFallScene";
import ElasticCollisionScene from "../models/physics/ElasticCollisionScene";
import PlasticCollisionScene from "../models/physics/PlasticCollisionScene";
import InclinedPlaneFormulas from "../components/physics/InclinedPlaneFormulas";
import Pulleys2Formulas from "../components/physics/Pulleys2Formulas";
import Pulleys3Formulas from "../components/physics/Pulleys3Formulas";
import PendulumFormulas from "../components/physics/PendulumFormulas";
import SpringFormulas from "../components/physics/SpringFormulas";
import CircularMotionFormulas from "../components/physics/CircularMotionFormulas";
import ProjectileMotionFormulas from "../components/physics/ProjectileMotion";
import FreeFallFormulas from "../components/physics/FreeFallFormulas";
import ElasticCollisionFormulas from "../components/physics/ElasticCollisionFormulas";
import PlasticCollisionFormulas from "../components/physics/PlasticCollisionFormulas";
import {
  inclinedPlane,
  pulley2,
  pulleys3,
  pendulum,
  spring,
  circularMotion,
  projectile,
  freeFall,
  elasticCollision,
  plasticCollision,
} from "../assets/icons";

const physicsObjects = [
  { id: "inclined_plane", label: "Plan înclinat", icon: inclinedPlane },
  { id: "pulley_system2", label: "Scripeți 2 corpuri", icon: pulley2 },
  { id: "pulley_system3", label: "Scripteți 3 corpuri", icon: pulleys3 },
  { id: "pendulum", label: "Pendul", icon: pendulum },
  { id: "spring", label: "Resort", icon: spring },
  { id: "circular_motion", label: "Mișcare circulară", icon: circularMotion },
  { id: "projectile_motion", label: "Mișcare de proiectil", icon: projectile },
  { id: "free_fall", label: "Cădere liberă", icon: freeFall },
  {
    id: "elastic_collision",
    label: "Coliziune elastică",
    icon: elasticCollision,
  },
  {
    id: "plastic_collision",
    label: "Coliziune plastică",
    icon: plasticCollision,
  },
];

const Physics = () => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const g = 9.81;
  const v0 = 12;
  const theta = 45;

  return (
    <div className="flex bg-gradient-to-b from-[#fdf4ff] via-[#f3e8ff] to-[#fff7ed] min-h-screen pt-[80px]">
      <SideMenu
        items={physicsObjects}
        selectedItem={selectedObject}
        onSelect={(item) => {
          setSelectedObject(item);
          setSliderValue(0);
        }}
        header={"Probleme de fizică"}
      />

      <main className="flex-1 p-8 overflow-y-auto text-black-500">
        {!selectedObject && <PhysicsLanding />}
        {selectedObject && selectedObject.id === "inclined_plane" && (
          <div className="space-y-6">
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md relative">
              <InclinedPlaneScene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-mulberry font-semibold">Poziție:</label>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <InclinedPlaneFormulas />
          </div>
        )}
        {selectedObject && selectedObject.id === "pulley_system2" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md relative">
              <Pulley2Scene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">
                Poziție mase:
              </label>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <Pulleys2Formulas />
          </>
        )}
        {selectedObject && selectedObject.id === "pulley_system3" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-rosy-brown bg-white shadow-md relative">
              <Pulley3Scene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="text-rosy-brown font-semibold">
                Poziție mase:
              </label>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <Pulleys3Formulas />
          </>
        )}
        {selectedObject && selectedObject.id === "pendulum" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md relative">
              <PendulumScene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">
                Unghi pendul (°):
              </label>
              <input
                type="range"
                min={-60}
                max={60}
                step={1}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <PendulumFormulas />
          </>
        )}
        {selectedObject?.id === "spring" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <SpringMassScene extension={sliderValue} />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">
                Deformare arc (m):
              </label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <SpringFormulas />
          </>
        )}
        {selectedObject?.id === "circular_motion" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <CircularMotionScene speed={sliderValue} />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">
                Viteză (m/s):
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <CircularMotionFormulas />
          </>
        )}
        {selectedObject?.id === "projectile_motion" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <ProjectileScene time={sliderValue} />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">Time (s):</label>
              <input
                type="range"
                min={0}
                max={(2 * 12 * Math.sin((45 * Math.PI) / 180)) / 9.8}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <ProjectileMotionFormulas />
          </>
        )}
        {selectedObject?.id === "free_fall" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <FreeFallScene time={sliderValue} />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="text-mulberry font-semibold">Timp (s):</label>
              <input
                type="range"
                min={0}
                max={Math.sqrt((2 * 5) / 9.8)}
                step={0.01}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                className="w-full max-w-lg accent-purple-600 bg-purple-200/40 h-2 rounded appearance-none"
              />
            </div>
            <FreeFallFormulas />
          </>
        )}
        {selectedObject?.id === "elastic_collision" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <ElasticCollisionScene />
            </div>
            <ElasticCollisionFormulas />
          </>
        )}
        {selectedObject?.id === "plastic_collision" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
              <PlasticCollisionScene />
            </div>
            <PlasticCollisionFormulas />
          </>
        )}
      </main>
    </div>
  );
};

export default Physics;
