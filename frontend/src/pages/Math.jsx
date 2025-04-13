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
import CylinderScene from "../models/math/Cylinder";
import CylinderFormulas from "../components/math/CylinderFormulas";
import ConeScene from "../models/math/Cone";
import ConeFormulas from "../components/math/ConeFormulas";
import PyramidScene from "../models/math/Pyramid";
import PyramidFormulas from "../components/math/PyramidFormulas";

const mathObjects = [
  { id: "cube", label: "Cub", icon: cube },
  { id: "parallelepiped", label: "Paralelipiped", icon: parallelepiped },
  { id: "cylinder", label: "Cilindru", icon: cylinder },
  { id: "sphere", label: "Sferă", icon: sphere },
  { id: "cone", label: "Con", icon: cone },
  { id: "pyramid", label: "Piramidă", icon: pyramid },
];

const Math = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lavender via-[#f8edf7] to-[#fdf6f6] pt-[80px]">
      {/* Sidebar */}
      <SideMenu
        items={mathObjects}
        selectedItem={selectedObject}
        onSelect={setSelectedObject}
      />

      {/* Main content */}
      <main className="flex-1 p-7 overflow-y-auto text-black-500">
        {!selectedObject && <MathLanding />}

        {selectedObject && (
          <div className="space-y-6">
            {selectedObject.id === "cube" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
                  <CubeScene />
                </div>
                <CubeFormulas />
              </>
            )}

            {selectedObject.id === "parallelepiped" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-rosy-brown bg-white shadow-md">
                  <ParallelepipedScene />
                </div>
                <ParallelepipedFormulas />
              </>
            )}

            {selectedObject.id === "sphere" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
                  <SphereScene />
                </div>
                <SphereFormulas />
              </>
            )}

            {selectedObject.id === "cylinder" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-rosy-brown bg-white shadow-md">
                  <CylinderScene />
                </div>
                <CylinderFormulas />
              </>
            )}

            {selectedObject.id === "cone" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-mulberry bg-white shadow-md">
                  <ConeScene />
                </div>
                <ConeFormulas />
              </>
            )}

            {selectedObject.id === "pyramid" && (
              <>
                <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-rosy-brown bg-white shadow-md">
                  <PyramidScene />
                </div>
                <PyramidFormulas />
              </>
            )}
          </div>
        )}

        {!selectedObject && (
          <p className="text-rosy-brown italic mt-6">
            Selectează un obiect din meniu pentru a începe explorarea 3D.
          </p>
        )}
      </main>
    </div>
  );
};

export default Math;
