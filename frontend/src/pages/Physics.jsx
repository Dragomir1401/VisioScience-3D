import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import PhysicsLanding from "../components/physics/PhysicsLanding";
import InclinedPlaneScene from "../models/physics/InclinedPlane";

const physicsObjects = [{ id: "inclined_plane", label: "InclinedPlane" }];

const Physics = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <div className="flex">
      <SideMenu
        items={physicsObjects}
        selectedItem={selectedObject}
        onSelect={setSelectedObject}
      />

      <main className="flex-1 p-8">
        {!selectedObject && <PhysicsLanding />}
        {selectedObject ? (
          <div className="space-y-4">
            {selectedObject.id === "inclined_plane" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
                  <InclinedPlaneScene />
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Selectează o tema din meniu.</p>
        )}
      </main>
    </div>
  );
};

export default Physics;
