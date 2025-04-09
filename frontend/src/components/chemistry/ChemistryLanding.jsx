import React from "react";

const ChemistryLanding = () => {
  return (
    <div className="bg-green-50 p-8 rounded-lg shadow-md text-green-800 space-y-6">
      <h2 className="text-3xl font-bold text-green-700">
        Bine ai venit la secțiunea de Chimie
      </h2>
      <p className="text-lg">
        În această secțiune vei putea explora, organiza și încărca fișiere
        <code className="bg-green-100 mx-1 px-1 py-0.5 rounded">.mol</code>
        pentru a vizualiza și studia structura moleculelor într-un mod interactiv.
      </p>

      <div className="flex items-center gap-6">
        {/* <img
          src={moleculeIcon}
          alt="Molecule Icon"
          className="w-20 h-20 object-contain drop-shadow-lg"
        /> */}
        <p className="text-md">
          Poți adăuga molecule noi din meniul din stânga și poți examina
          lista existentă pentru a vedea detaliile fiecăreia.
        </p>
      </div>

      <p className="text-sm italic text-green-500">
        Hint: după ce încarci un fișier 
        <code className="bg-green-100 mx-1 px-1 py-0.5 rounded">.mol</code>, îl
        vei putea selecta pentru a afișa datele moleculei – iar mai târziu vom
        extinde cu vizualizare 3D.
      </p>
    </div>
  );
};

export default ChemistryLanding;
