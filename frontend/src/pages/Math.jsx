// pages/Math.jsx
import React, { useState } from "react";
import SideMenu from "../components/SideMenu";

const mathObjects = [
  { id: "cube", label: "Cub" },
  { id: "parallelepiped", label: "Paralelipiped" },
  { id: "cylinder", label: "Cilindru" },
  { id: "sphere", label: "Sferă" },
  { id: "cone", label: "Con" },
  { id: "pyramid", label: "Piramidă" },
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
        {selectedObject ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">
              Volumul {selectedObject.label}
            </h1>
            {/* Replace this with 3D visualization or formula component */}
            <p>
              Aici poți afișa o animație sau formula pentru{" "}
              {selectedObject.label}.
            </p>
          </div>
        ) : (
          <p className="text-gray-600">Selectează un obiect din meniu.</p>
        )}
      </main>
    </div>
  );
};

export default Math;
