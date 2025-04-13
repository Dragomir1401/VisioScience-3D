import React from "react";

const ChemistryLanding = () => {
  return (
    <div className="bg-[#fef6ff] p-8 rounded-xl shadow-xl text-black-500 space-y-6 border border-mulberry">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-mulberry to-rosy-brown bg-clip-text text-transparent">
        Bine ai venit la secțiunea de Chimie
      </h2>

      <p className="text-base sm:text-lg font-worksans text-black/80">
        În această secțiune vei putea explora, organiza și încărca fișiere
        <code className="bg-[#f3e8ff] text-purple-800 mx-1 px-1 py-0.5 rounded shadow-sm text-sm">
          .mol
        </code>
        pentru a vizualiza și studia structura moleculelor într-un mod interactiv și 3D.
      </p>

      <div className="flex items-start gap-4 font-worksans text-sm sm:text-base">
        {/* <img
          src={moleculeIcon}
          alt="Molecule Icon"
          className="w-16 h-16 object-contain drop-shadow-lg"
        /> */}
        <p className="text-black/80">
          Poți adăuga molecule noi din meniul lateral și vizualiza structura acestora
          în timp real. Fiecare moleculă conține detalii despre atomi, legături și o
          reprezentare 3D ușor de înțeles.
        </p>
      </div>

      <p className="text-sm italic text-purple-600 font-medium">
        Hint: după ce încarci un fișier
        <code className="bg-[#f3e8ff] text-purple-800 mx-1 px-1 py-0.5 rounded shadow-sm text-xs">
          .mol
        </code>
        îl vei putea selecta pentru a vizualiza toate datele moleculei.
      </p>
    </div>
  );
};

export default ChemistryLanding;
