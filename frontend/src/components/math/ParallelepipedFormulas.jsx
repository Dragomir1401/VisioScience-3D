import React from "react";

const ParallelepipedFormulas = () => {
  return (
    <div className="bg-white border border-purple-300 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-800">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Paralelipiped</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = L × l × h
        </li>
        <li>
          <span className="font-bold">Arie totală:</span> A = 2 × (L × l + L × h
          + l × h)
        </li>
        <li>
          <span className="font-bold">Diagonală spațială:</span> d = √(L² + l² +
          h²)
        </li>
        <li>
          <span className="font-bold">Diagonalele fețelor:</span> d<sub>1</sub>{" "}
          = √(L² + l²), d<sub>2</sub> = √(L² + h²), d<sub>3</sub> = √(l² + h²)
        </li>
        <li>
          <span className="font-bold">Aria feței laterale:</span> A = L × h
        </li>
        <li>
          <span className="font-bold">Aria feței de jos:</span> A = L × l
        </li>
        <li>
          <span className="font-bold">Aria feței de sus:</span> A = l × h
        </li>
        <li>
          <span className="font-bold">Aria celor 4 fețe laterale:</span> A = 2 ×
          h × (L + l)
        </li>
        <li>
          <span className="font-bold">Perimetrul bazelor:</span> P = 2 × (L + l)
        </li>
        <li>
          <span className="font-bold">Raza sferei înscrisă:</span> r = V / (2 ×
          (L + l + h))
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">l</span> este lungimea,{" "}
        <span className="font-bold">L</span> este lățimea și{" "}
        <span className="font-bold">h</span> este înălțimea paralelipipedului.
      </p>
    </div>
  );
};

export default ParallelepipedFormulas;
