import React from "react";

const SphereFormulas = () => {
  return (
    <div className="bg-purple-100 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-900">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Sferă</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = 4/3 × π × r³
        </li>
        <li>
          <span className="font-bold">Arie de suprafață:</span> A = 4 × π × r²
        </li>
        <li>
          <span className="font-bold">Diametru:</span> d = 2 × r
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">r</span> reprezintă raza sferei.
      </p>
    </div>
  );
};

export default SphereFormulas;
