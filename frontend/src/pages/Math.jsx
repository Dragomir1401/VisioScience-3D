import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import {
  cube,
  parallelepiped,
  cylinder,
  sphere,
  cone,
  pyramid,
} from "../assets/icons";
import CubeScene from "../models/math/Cube";
import CubeFormulas from "../components/math/CubeFormulas";
import ParallelepipedScene from "../models/math/Parallelepiped";
import ParallelepipedFormulas from "../components/math/ParallelepipedFormulas";
import MathLanding from "../components/math/MathLanding";
import SphereScene from "../models/math/Sphere";
import SphereFormulas from "../components/math/SphereFormulas";

const mathObjects = [
  { id: "cube", label: "Cub", icon: cube },
  { id: "parallelepiped", label: "Parallelepiped", icon: parallelepiped },
  { id: "cylinder", label: "Cilindru", icon: cylinder },
  { id: "sphere", label: "Sferă", icon: sphere },
  { id: "cone", label: "Con", icon: cone },
  { id: "pyramid", label: "Piramidă", icon: pyramid },
];

const Math = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <div className="flex">
      <SideMenu
        items={mathObjects}
        selectedItem={selectedObject}
        onSelect={setSelectedObject}
      />

      <main className="flex-1 p-8">
        {!selectedObject && <MathLanding />}
        {selectedObject ? (
          <div className="space-y-4">
            {selectedObject.id === "cube" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
                  <CubeScene />
                </div>
                <CubeFormulas />
              </>
            )}
            {selectedObject.id === "parallelepiped" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
                  <ParallelepipedScene />
                </div>
                <ParallelepipedFormulas />
              </>
            )}

            {selectedObject.id === "sphere" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
                  <SphereScene />
                </div>
                <SphereFormulas />
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Selectează un obiect din meniu.</p>
        )}
      </main>
    </div>
  );
};

export default Math;
