import React, { useState, useEffect } from "react";
import ChemistryLanding   from "../components/chemistry/ChemistryLanding";
import ChemistryAddForm   from "../components/chemistry/ChemistryForm";
import Molecule3DViewer   from "../models/chemistry/Molecule";
import PeriodicTable3D    from "../components/chemistry/PeriodicTable"; 

export default function Chemistry() {
  const [molecules,   setMolecules]   = useState([]);
  const [selectedMol, setSelectedMol] = useState(null);
  const [viewMode,    setViewMode]    = useState("landing"); 
  const [error,       setError]       = useState("");
  const [message,     setMessage]     = useState("");

  useEffect(() => { fetchMolecules(); }, []);

  async function fetchMolecules() {
    try {
      setError(""); setMessage("");
      const res  = await fetch("http://localhost:8000/feed/chem/molecules");
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const data = await res.json();
      if (!data || data.length === 0) { setError("No molecules found"); return; }
      setMolecules(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch molecules");
    }
  }

  const handleSelectMol   = (mol) => { setSelectedMol(mol); setViewMode("detail"); setError(""); setMessage(""); };
  const handleAddNew      = ()    => { setViewMode("upload");  setSelectedMol(null); setError(""); setMessage(""); };
  const handleGoLanding   = ()    => { setViewMode("landing"); setSelectedMol(null); setError(""); setMessage(""); };
  const handleShowPTable  = ()    => { setViewMode("ptable");  setSelectedMol(null); setError(""); setMessage(""); };

  function onCreateSuccess() { setMessage("Molecule created successfully."); setSelectedMol(null); fetchMolecules(); }
  function onError(msg)      { setError(msg); }

  async function handleDeleteMol(id) {
    if (!window.confirm("Sigur vrei să ștergi această moleculă?")) return;
    try {
      setError(""); setMessage("");
      const res = await fetch(`http://localhost:8000/feed/chem/molecules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Molecula a fost ștearsă cu succes.");
      if (selectedMol?.id === id) { setSelectedMol(null); setViewMode("landing"); }
      fetchMolecules();
    } catch (err) {
      setError("Eroare la ștergere: " + err.message);
    }
  }

  return (
    <div className="flex mt-12">
      <aside
        className="w-64 min-h-screen p-5 shadow-md bg-gradient-to-br 
                   from-[#f5f3ff] via-[#ede9fe] to-[#fff7ed] text-purple-800 
                   border-r border-purple-200 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-purple-700 tracking-wide">Molecule</h2>

          <button
            onClick={handleAddNew}
            className="w-full text-left px-4 py-2 rounded-md transition-all 
                       shadow-sm border bg-white border-transparent hover:bg-purple-100 hover:border-purple-300 
                       text-purple-700 font-semibold mb-4">
            + Adaugă moleculă
          </button>

          <ul className="space-y-3">
            {molecules.map((mol) => (
              <li key={mol.id} className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectMol(mol)}
                  className={`flex-1 text-left px-4 py-2 rounded-md transition-all flex items-center gap-2 shadow-sm border ${
                    selectedMol?.id === mol.id && viewMode === "detail"
                      ? "bg-purple-600 text-white border-purple-700"
                      : "bg-white border-transparent hover:bg-purple-100 hover:border-purple-300"
                  }`}>
                  {mol.metadata.name}
                </button>
                <button
                  onClick={() => handleDeleteMol(mol.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded transition"
                  title="Șterge molecula">
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <hr className="my-4 border-purple-300" />
          <button
            onClick={handleGoLanding}
            className="w-full text-left px-4 py-2 rounded-md transition-all 
                       bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium">
            &larr; Înapoi la introducere
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-4 bg-gradient-to-b from-[#fdf4ff] via-[#f3e8ff] to-[#fff7ed]">
        {message && (
          <div className="text-green-700 border border-green-300 bg-green-100 px-4 py-2 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="text-red-700 border border-red-300 bg-red-100 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        {viewMode === "landing" && !selectedMol && (
          <ChemistryLanding onShowTable={handleShowPTable} />
        )}

        {viewMode === "upload" && (
          <div className="p-6 bg-white border-2 border-mulberry rounded-lg shadow-xl">
            <ChemistryAddForm onCreateSuccess={onCreateSuccess} onError={onError} />
          </div>
        )}

        {viewMode === "detail" && selectedMol && (
          <div className="p-6 bg-white border-2 border-mulberry rounded-lg shadow-xl">
            <h2 className="text-xl font-bold text-mulberry mb-2">
              {selectedMol.metadata.name} ({selectedMol.formula})
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              <strong>Descriere:</strong> {selectedMol.metadata.description}
            </p>
            <Molecule3DViewer moleculeId={selectedMol.id} />
          </div>
        )}

        {viewMode === "ptable" && (
          <div className="p-6 bg-white border-2 border-mulberry rounded-lg shadow-xl h-[80vh]">
            <h2 className="text-xl font-bold text-mulberry mb-4">
              Tabelul periodic interactiv
            </h2>
            <PeriodicTable3D />
          </div>
        )}
      </main>
    </div>
  );
}
