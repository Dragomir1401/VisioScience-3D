import React from "react";

const PyramidFormulas = () => {
  return (
    <div className="bg-white border border-purple-300 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-800">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Piramidă</span>
      </h2>

      <ul className="list-disc list-inside space-y-2">
        <li>
          <span className="font-bold">Volum:</span> V = 1/3 × A × h
        </li>
        <li>
          <span className="font-bold">Arie totală:</span> A<sub>total</sub> = A
          + (1/2 × P × l)
        </li>
        <li>
          <span className="font-bold">Arie laterală:</span> A<sub>lateral</sub>{" "}
          = 1/2 × P × l
        </li>
        <li>
          <span className="font-bold">Aria bazei:</span> A<sub>bază</sub> = L²
        </li>
        <li>
          <span className="font-bold">Perimetrul bazei:</span> P = 4 × L
        </li>
        <li>
          <span className="font-bold">Înălțimea oblică:</span> l = √(h² +
          (L/2)²)
        </li>
        <li>
          <span className="font-bold">Înălțimea:</span> h = √(l² - (L/2)²)
        </li>
      </ul>

      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">A</span> este aria bazei,{" "}
        <span className="font-bold">h</span> este înălțimea,{" "}
        <span className="font-bold">L</span> este latura bazei,{" "}
        <span className="font-bold">P</span> este perimetrul bazei, iar{" "}
        <span className="font-bold">l</span> este înălțimea oblică.
      </p>
    </div>
  );
};

export default PyramidFormulas;
