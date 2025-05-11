import React, { useEffect, useState } from "react";

const VectorFormulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/feed/shape/vector");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFormulas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Eroare la încărcarea formulelor pentru Vector.");
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  return (
    <div className="bg-white border border-sky-300 p-4 rounded-lg shadow mt-4 text-sky-800">
      <h3 className="text-lg font-bold border-b border-sky-300 pb-2 mb-3 font-sans">
        Concepte și Formule pentru Vector
      </h3>
      {loading ? (
        <p className="text-gray-500">Se încarcă formulele…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {formulas.length === 0 ? (
            <div className="italic text-gray-500">Nu există formule pentru Vector.</div>
          ) : (
            formulas.map((f, idx) => (
                <div
                key={f._id || f.formula?.name || idx}
                className="bg-sky-50 border border-sky-200 rounded-lg shadow-sm p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"
              >
                <div className="text-base font-semibold text-sky-900 font-sans">
                  {f.formula.name}
                </div>
                <div className="text-lg font-mono text-sky-700 break-words select-all">
                  {f.formula.expr}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VectorFormulas;
