import React from "react";

const CubeFormulas = () => {
  return (
    <div className="bg-purple-100 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-900">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Cub</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = L³
        </li>
        <li>
          <span className="font-bold">Arie totală:</span> A = 6 × L²
        </li>
        <li>
          <span className="font-bold">Diagonală spațială:</span> d = L × √3
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">l</span> este lungimea unei laturi a
        cubului.
      </p>
    </div>
  );
};

export default CubeFormulas;
