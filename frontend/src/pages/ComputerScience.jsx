// src/pages/ComputerScience.jsx
import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import CSLanding from "../components/computer_science/ComputerScienceLanding";
import VectorScene from "../models/computer_science/Vector";
import VectorOperations from "../models/computer_science/VectorOperations";

const csObjects = [
  { id: "vector", label: "Vectori", icon: "" },
];

const ComputerScience = () => {
  const [selected, setSelected] = useState(null);
  const [elements, setElements] = useState([1, 2, 3, 4, 5]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lavender via-[#f8edf7] to-[#fdf6f6] pt-[80px]">
      <SideMenu
        items={csObjects}
        selectedItem={selected}
        onSelect={setSelected}
      />

      <main className="flex-1 p-7 overflow-y-auto text-black-500">
        {!selected && <CSLanding />}

        {selected?.id === "vector" && (
          <div className="space-y-6">
            <VectorScene elements={elements} />
            <VectorOperations
              elements={elements}
              onChange={setElements}
            />
          </div>
        )}

        {!selected && (
          <p className="text-rosy-brown italic mt-6">
            Selectează un subiect din meniul din stânga pentru secţiunea de Informatică.
          </p>
        )}
      </main>
    </div>
  );
};

export default ComputerScience;
