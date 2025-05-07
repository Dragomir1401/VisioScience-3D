import React from "react";
// import { StarIcon } from "../../assets/icons";

const AstronomyLanding = () => (
  <div className="bg-[#f0f8ff] p-8 rounded-xl shadow-xl text-black-500 space-y-6 border border-blue-300">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
      Bine ai venit la secțiunea de Astronomie
    </h2>
    <p className="text-lg">
      Aici vei explora universul în 3D: planete, stele, orbită și multe altele.
      Învață despre mișcările planetelor, eclipse, și vizualizări ale
      constelațiilor.
    </p>
    <div className="flex items-center gap-6">
      {/* <img className="w-16 h-16" src={StarIcon} alt="Star icon" /> */}
      <p className="text-md">
        Alege „Astronomie” din meniul din stânga pentru a începe explorarea
        cosmică!
      </p>
    </div>
    <p className="text-sm italic text-blue-500">
      Hint: poți roti scena și da zoom în/out cu mouse-ul pentru a vedea
      detaliile.
    </p>
  </div>
);

export default AstronomyLanding;
