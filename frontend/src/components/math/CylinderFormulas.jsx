import React from "react";

const CylinderFormulas = () => {
  return (
    <div className="bg-purple-100 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-900">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Cilindru</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = π × r² × h
        </li>
        <li>
          <span className="font-bold">Arie laterală:</span> A<sub>laterală</sub>{" "}
          = 2 × π × r × h
        </li>
        <li>
          <span className="font-bold">Arie totală:</span> A<sub>totală</sub> = 2
          × π × r × (r + h)
        </li>
        <li>
          <span className="font-bold">Diagonală:</span> d = √(4r² + h²)
        </li>
        <li>
          <span className="font-bold">Aria bazei:</span> A<sub>bază</sub> = π ×
          r²
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">r</span> este raza și{" "}
        <span className="font-bold">h</span> este înălțimea cilindrului.
      </p>
    </div>
  );
};

export default CylinderFormulas;
