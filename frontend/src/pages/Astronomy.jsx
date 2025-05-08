import React, { useState } from "react";
import SideMenu from "../components/SideMenu";
import AstronomyLanding from "../components/astronomy/AstronomyLanding";
import ThreeMercuryScene from "../models/astronomy/MercuryScene";
import ThreeVenusScene from "../models/astronomy/VenusScene";
import ThreeEarthScene from "../models/astronomy/EarthScene";
import ThreeMarsScene from "../models/astronomy/MarsScene";
import ThreeJupiterScene from "../models/astronomy/JupiterScene.jsx";
import ThreeSaturnScene from "../models/astronomy/SaturnScene";
import ThreeUranusScene from "../models/astronomy/UranusScene";
import ThreeNeptuneScene from "../models/astronomy/NeptuneScene";
import SolarSystemScene from "../models/astronomy/SolarSystemScene";

// import {
//   mercuryIcon,
//   venusIcon,
//   earthIcon,
//   marsIcon,
//   jupiterIcon,
//   saturnIcon,
//   uranusIcon,
//   neptuneIcon,
// } from "../assets/icons";

const astroObjects = [
  { id: "solar-system", label: "Sistem Solar", icon: "" },
  { id: "mercury", label: "Mercur", icon: "" },
  { id: "venus", label: "Venus", icon: "" },
  { id: "earth", label: "Pământ", icon: "" },
  { id: "mars", label: "Marte", icon: "" },
  { id: "jupiter", label: "Jupiter", icon: "" },
  { id: "saturn", label: "Saturn", icon: "" },
  { id: "uranus", label: "Uranus", icon: "" },
  { id: "neptune", label: "Neptun", icon: "" },
];

const Astronomy = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-[#e8f1ff] to-[#f0faff] pt-[80px]">
      <SideMenu
        items={astroObjects}
        selectedItem={selected}
        onSelect={setSelected}
        header="Sistem Solar"
      />

      <main className="flex-1 p-7 overflow-y-auto text-gray-800">
        {!selected && <AstronomyLanding />}

        {selected?.id === "mercury" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-blue-300">
            <ThreeMercuryScene />
          </div>
        )}
        {selected?.id === "venus" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-yellow-300">
            <ThreeVenusScene />
          </div>
        )}
        {selected?.id === "earth" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-green-300">
            <ThreeEarthScene />
          </div>
        )}
        {selected?.id === "mars" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-red-300">
            <ThreeMarsScene />
          </div>
        )}
        {selected?.id === "jupiter" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-orange-300">
            <ThreeJupiterScene />
          </div>
        )}
        {selected?.id === "saturn" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-yellow-500">
            <ThreeSaturnScene />
          </div>
        )}
        {selected?.id === "uranus" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-teal-300">
            <ThreeUranusScene />
          </div>
        )}
        {selected?.id === "neptune" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-indigo-400">
            <ThreeNeptuneScene />
          </div>
        )}

        {selected?.id === "solar-system" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-gray-300">
            <SolarSystemScene />
          </div>
        )}

        {!selected && (
          <p className="mt-6 italic text-gray-500">
            Alege o planetă din meniul din stânga pentru a începe explorarea!
          </p>
        )}
      </main>
    </div>
  );
};

export default Astronomy;
