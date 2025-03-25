import React from "react";
import { cube } from "../../assets/icons";

const PhysicsLanding = () => {
  return (
    <div className="bg-purple-50 p-8 rounded-lg shadow-md text-purple-800 space-y-6">
      <h2 className="text-3xl font-bold text-purple-700">
        Bine ai venit la secțiunea de Fizică
      </h2>
      <p className="text-lg">
        În această secțiune vei putea explora în mod interactiv fenomene de
        fizică și concepte asociate. Vei putea învăța despre forțe, mișcare și
        alte concepte importante într-un mod vizual și intuitiv.
      </p>

      <div className="flex items-center gap-6">
        <img
          src={cube}
          alt="Cub"
          className="w-20 h-20 object-contain drop-shadow-lg"
        />
        <p className="text-md">
          Alege o temă din meniul din stânga pentru a începe explorarea!
        </p>
      </div>

      <p className="text-sm italic text-purple-500">
        Hint: poți roti modelele 3D cu mouse-ul și poți observa dimensiunile
        lor.
      </p>
    </div>
  );
};

export default PhysicsLanding;
