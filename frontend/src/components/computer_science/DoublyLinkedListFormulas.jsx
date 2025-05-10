import React, { useEffect, useState } from "react";

const DoublyLinkedListFormulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormulas = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/feed/shape/doubly_linked_list");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setFormulas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Eroare la încărcarea formulelor pentru Lista Dublu Înlănțuită.");
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  return (
    <div className="bg-white border border-green-300 p-4 rounded-lg shadow mt-4 text-green-800">
      <h3 className="text-lg font-bold border-b border-green-300 pb-2 mb-3 font-sans">
        Concepte și Formule pentru Lista Dublu Înlănțuită
      </h3>
      {loading ? (
        <p className="text-gray-500">Se încarcă formulele…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {formulas.length === 0 ? (
            <div className="italic text-gray-500">Nu există formule pentru Lista Dublu Înlănțuită.</div>
          ) : (
            formulas.map((f) => (
              <div
                key={f._id}
                className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-3 flex flex-col gap-1 hover:shadow-md transition-shadow"
              >
                <div className="text-base font-semibold text-green-900 font-sans">
                  {f.formula.name}
                </div>
                <div className="text-lg font-mono text-green-700 break-words select-all">
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

export default DoublyLinkedListFormulas;
