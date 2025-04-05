import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import PhysicsLanding from "../components/physics/PhysicsLanding";
import InclinedPlaneScene from "../models/physics/InclinedPlane";

const physicsObjects = [{ id: "inclined_plane", label: "InclinedPlane" }];

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
      </main>
    </div>
  );
};

export default Physics;
