import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import PhysicsLanding from "../components/physics/PhysicsLanding";
import InclinedPlaneScene from "../models/physics/InclinedPlane";
import Pulley2Scene from "../models/physics/PulleyFixed";
import Pulley3Scene from "../models/physics/PulleyFixedMobile";
import PendulumScene from "../models/physics/Pendulum";

const physicsObjects = [
  { id: "inclined_plane", label: "InclinedPlane" },
  { id: "pulley_system2", label: "Pullies2Bodies" },
  { id: "pulley_system3", label: "Pullies3Bodies" },
  { id: "pendulum", label: "Pendul" },
  // { id: "spring", label: "Arc" },
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
    <div className="flex">
      <SideMenu
        items={physicsObjects}
        selectedItem={selectedObject}
        onSelect={(item) => {
          setSelectedObject(item);
          setSliderValue(0);
        }}
      />

      <main className="flex-1 p-8">
        {!selectedObject && <PhysicsLanding />}
        {selectedObject && selectedObject.id === "inclined_plane" && (
          <>
            <div className="space-y-4">
              <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg relative">
                <InclinedPlaneScene sliderValue={sliderValue} />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Poziție:</label>
                <input
                  type="range"
                  min={-4}
                  max={4}
                  step={0.01}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                  className="w-full max-w-lg accent-purple-600 
                bg-purple-200/40 rounded-lg overflow-hidden 
                appearance-none h-2 cursor-pointer 
                transition-all"
                />
              </div>
            </div>
          </>
        )}
        {selectedObject && selectedObject.id === "pulley_system2" && (
          <>
            <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg relative">
              <Pulley2Scene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-purple-800 font-semibold">
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
            <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg relative">
              <Pulley3Scene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-purple-800 font-semibold">
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
            <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg relative">
              <PendulumScene sliderValue={sliderValue} />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-purple-800 font-semibold">
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
      </main>
    </div>
  );
};

export default Physics;
