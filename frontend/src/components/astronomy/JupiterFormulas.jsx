import React, { useEffect, useState } from "react";

const JupiterFormulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/feed/shape/jupiter");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFormulas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Eroare la încărcarea formulelor pentru Jupiter.");
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  return (
    <div className="bg-white border border-purple-300 p-4 rounded-lg shadow mt-4 text-purple-800">
      <h3 className="text-lg font-semibold border-b border-purple-300 pb-1 mb-2">
        Formule pentru Jupiter
      </h3>
      {loading ? (
        <p className="text-gray-500">Se încarcă formulele…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {formulas.length === 0 ? (
            <li className="italic text-gray-500">Nu există formule pentru Jupiter.</li>
          ) : (
            formulas.map((f) => (
              <li key={f._id}>
                <span className="font-bold">{f.formula.name}:</span> {f.formula.expr}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default JupiterFormulas;
