import React from "react";
import { cube } from "../../assets/icons";

const MathLanding = () => {
  return (
    <div className="bg-[#fef6ff] p-8 rounded-xl shadow-xl text-black-500 space-y-6 border border-mulberry">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-mulberry to-rosy-brown bg-clip-text text-transparent">
        Bine ai venit la secțiunea de Matematică
      </h2>
      <p className="text-lg">
        În această secțiune vei putea explora în mod interactiv forme geometrice
        3D și formulele lor asociate. Vei putea învăța despre volume, arii și
        alte concepte importante într-un mod vizual și intuitiv.
      </p>

      <div className="flex items-center gap-6">
        <img
          src={cube}
          alt="Cub"
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
        <p className="text-md">
          Alege o formă din meniul din stânga pentru a începe explorarea!
        </p>
      </div>

      <p className="text-sm italic text-purple-500">
        Hint: poți roti modelele 3D cu mouse-ul și poți observa dimensiunile
        lor.
      </p>
    </div>
  );
};

export default MathLanding;
