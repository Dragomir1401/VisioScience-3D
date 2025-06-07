import React from "react";
import { vector } from "../../assets/icons";

const CSLanding = ({ onShowCppEditor }) => (
  <div className="bg-[#fef6ff] p-8 rounded-xl shadow-xl text-black-500 space-y-6 border border-mulberry">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-mulberry to-rosy-brown bg-clip-text text-transparent">
      Bine ai venit la secțiunea de Informatică
    </h2>
    <p className="text-lg">
      Aici vei explora structuri de date în 3D și operațiile de bază pe ele. De
      exemplu, vectori dinamici cu inserare, ştergere și parcurgere.
    </p>
    <div className="flex items-center gap-6">
      <img
        src={vector}
        alt="Vector"
        className="w-8 h-8 object-contain drop-shadow-lg"
      />
      <p className="text-md">
        Alege "Vectori" din meniul din stânga pentru a începe demo-ul 3D!
      </p>
    </div>
    <p className="text-sm italic text-purple-500">
      Hint: poți roti scena și da zoom în/out cu mouse-ul.
    </p>
    <button
      onClick={onShowCppEditor}
      className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-md
                 bg-gradient-to-r from-blue-400 to-mulberry text-white
                 hover:from-purple-700 hover:to-mulberry-600 transition
                 shadow-lg"
    >
      🖥️ Editor C++ și Vizualizare 3D
    </button>
  </div>
);

export default CSLanding;
