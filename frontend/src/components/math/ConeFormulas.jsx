import React from "react";

const ConeFormulas = () => {
  return (
    <div className="bg-white border border-purple-300 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-800">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Con</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = 1/3 × π × r² × h
        </li>
        <li>
          <span className="font-bold">Arie totală:</span> A = π × r × (r + √(r²
          + h²))
        </li>
        <li>
          <span className="font-bold">Arie laterală:</span> A<sub>laterală</sub>{" "}
          = π × r × √(r² + h²)
        </li>
        <li>
          <span className="font-bold">Aria bazei:</span> A<sub>bază</sub> = π ×
          r²
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">r</span> este raza bazei, iar{" "}
        <span className="font-bold">h</span> este înălțimea conului.
      </p>
    </div>
  );
};

export default ConeFormulas;
