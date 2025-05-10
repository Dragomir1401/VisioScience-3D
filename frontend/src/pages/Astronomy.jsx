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
import MercuryFormulas from "../components/astronomy/MercuryFormulas";
import VenusFormulas from "../components/astronomy/VenusFormulas";
import EarthFormulas from "../components/astronomy/EarthFormulas";
import MarsFormulas from "../components/astronomy/MarsFormulas";
import JupiterFormulas from "../components/astronomy/JupiterFormulas";
import SaturnFormulas from "../components/astronomy/SaturnFormulas";
import UranusFormulas from "../components/astronomy/UranusFormulas";
import NeptuneFormulas from "../components/astronomy/NeptuneFormulas";
import SolarSystemFormulas from "../components/astronomy/SolarSystemFormulas";
import {
  mercury,
  venus,
  earth,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  solar_system,
} from "../assets/icons";

const astroObjects = [
  { id: "solar-system", label: "Sistem Solar", icon: solar_system },
  { id: "mercury", label: "Mercur", icon: mercury },
  { id: "venus", label: "Venus", icon: venus },
  { id: "earth", label: "Pământ", icon: earth },
  { id: "mars", label: "Marte", icon: mars },
  { id: "jupiter", label: "Jupiter", icon: jupiter },
  { id: "saturn", label: "Saturn", icon: saturn },
  { id: "uranus", label: "Uranus", icon: uranus },
  { id: "neptune", label: "Neptun", icon: neptune },
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
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-blue-300">
              <ThreeMercuryScene />
            </div>
            <MercuryFormulas />
          </>
        )}
        {selected?.id === "venus" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-yellow-300">
              <ThreeVenusScene />
            </div>
            <VenusFormulas />
          </>
        )}
        {selected?.id === "earth" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-green-300">
              <ThreeEarthScene />
            </div>
            <EarthFormulas />
          </>
        )}
        {selected?.id === "mars" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-red-300">
              <ThreeMarsScene />
            </div>
            <MarsFormulas />
          </>
        )}
        {selected?.id === "jupiter" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-orange-300">
              <ThreeJupiterScene />
            </div>
            <JupiterFormulas />
          </>
        )}
        {selected?.id === "saturn" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-yellow-500">
              <ThreeSaturnScene />
            </div>
            <SaturnFormulas />
          </>
        )}
        {selected?.id === "uranus" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-teal-300">
              <ThreeUranusScene />
            </div>
            <UranusFormulas />
          </>
        )}
        {selected?.id === "neptune" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-indigo-400">
              <ThreeNeptuneScene />
            </div>
            <NeptuneFormulas />
          </>
        )}

        {selected?.id === "solar-system" && (
          <>
            <div className="h-[600px] w-full rounded-xl overflow-hidden border-2 border-gray-300">
              <SolarSystemScene />
            </div>
            <SolarSystemFormulas />
          </>
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
