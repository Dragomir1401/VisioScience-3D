import React, { useEffect, useState } from "react";

const ConeFormulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/feed/shape/con");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFormulas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Eroare la încărcarea formulelor pentru con.");
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  return (
    <div className="bg-white border border-purple-300 p-6 rounded-lg shadow-md mt-6 space-y-4 text-purple-800">
      <h2 className="text-xl font-semibold border-b border-purple-300 pb-2">
        Formule pentru <span className="text-purple-700">Con</span>
      </h2>
      {loading ? (
        <p className="text-gray-500">Se încarcă formulele…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <ul className="list-disc list-inside space-y-2">
          {formulas.length === 0 ? (
            <li className="italic text-gray-500">Nu există formule pentru con.</li>
          ) : (
            formulas.map((f) => (
              <li key={f._id}>
                <span className="font-bold">{f.formula.name}:</span> {f.formula.expr}
              </li>
            ))
          )}
        </ul>
      )}
      <p className="text-sm italic text-purple-700">
        Unde <span className="font-bold">r</span> este raza bazei, iar {" "}
        <span className="font-bold">h</span> este înălțimea conului.
      </p>
    </div>
  );
};

export default ConeFormulas;
