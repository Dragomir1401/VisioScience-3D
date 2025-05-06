import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import PhysicsLanding from "../components/physics/PhysicsLanding";
import InclinedPlaneScene from "../models/physics/InclinedPlane";
import Pulley2Scene from "../models/physics/PulleyFixed";
import Pulley3Scene from "../models/physics/PulleyFixedMobile";
import PendulumScene from "../models/physics/Pendulum";
import SpringMassScene from "../models/physics/SpringScene";

const physicsObjects = [
  { id: "inclined_plane", label: "Plan înclinat" },
  { id: "pulley_system2", label: "Scripeți 2 corpuri" },
  { id: "pulley_system3", label: "Scripteți 3 corpuri" },
  { id: "pendulum", label: "Pendul" },
  { id: "spring", label: "Arc elastic" },
  // { id: "circular_motion", label: "Mișcare circulară" },
  // { id: "projectile_motion", label: "Mișcare de proiectil" },
  // { id: "free_fall", label: "Cădere liberă" },
  // { id: "collision", label: "Coliziune" },
  // { id: "torque", label: "Moment de forță" },
  // { id: "work_energy", label: "Lucru mecanic și energie" },
  // { id: "fluid_dynamics", label: "Dinamică fluidelor" },
  // { id: "thermodynamics", label: "Termodinamică" },
  // { id: "electromagnetism", label: "Electromagnetism" },
  // { id: "waves", label: "Unde" },
  // { id: "optics", label: "Optică" },
  // { id: "relativity", label: "Relativitate" },
];

const Physics = () => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);

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
          </>
        )}
      </main>
    </div>
  );
};

export default Physics;
