import React, { useState, useEffect } from "react";
import ChemistryLanding from "../components/chemistry/ChemistryLanding";
import ChemistryAddForm from "../components/chemistry/ChemistryForm";

export default function Chemistry() {
  const [molecules, setMolecules] = useState([]);
  const [selectedMol, setSelectedMol] = useState(null);
  const [viewMode, setViewMode] = useState("landing"); 
  // landing | upload | detail

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // La montare, fetch molecules
  useEffect(() => {
    fetchMolecules();
  }, []);

  async function fetchMolecules() {
    try {
      setError("");
      setMessage("");
      const res = await fetch("http://localhost:8000/feed/chem/molecules");
      if (!res.ok) {
        throw new Error(`Fetch error: ${res.status}`);
      }
      const data = await res.json();
      // if data is empty, set error
      if (!data || data.length === 0) {
        setError("No molecules found");
        return;
      }
      setMolecules(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch molecules");
    }
  }

  function handleSelectMol(mol) {
    setSelectedMol(mol);
    setViewMode("detail");
    setError("");
    setMessage("");
  }

  function handleAddNew() {
    setViewMode("upload");
    setSelectedMol(null);
    setError("");
    setMessage("");
  }

  // Callback la crearea reușită a unei molecule
  function onCreateSuccess() {
    setMessage("Molecule created successfully.");
    setViewMode("landing");
    setSelectedMol(null);
    fetchMolecules();
  }

  // Callback la eroare
  function onError(msg) {
    setError(msg);
  }

  // Buton jos pt revenire la landing
  function handleGoLanding() {
    setViewMode("landing");
    setSelectedMol(null);
    setError("");
    setMessage("");
  }

  return (
    <div className="flex mt-12">
      {/* --- SIDE MENU --- */}
      <aside
        className="w-64 min-h-screen p-4 shadow-md 
          bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100 
          text-purple-800 rounded-r-lg flex flex-col justify-between"
      >
        <div>
          <button
            className="w-full text-left px-3 py-2 rounded-md transition-all bg-purple-600 text-white font-semibold"
            onClick={handleAddNew}
          >
            + Add new molecule
          </button>

          <hr className="my-2 border-purple-300" />

          <h3 className="text-md font-semibold mb-2">Existing Molecules</h3>
          <ul className="space-y-2">
            {molecules.map((mol) => (
              <li
                key={mol.id}
                className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                  selectedMol?.id === mol.id && viewMode === "detail"
                    ? "bg-purple-600 text-white font-semibold"
                    : "hover:bg-purple-300"
                }`}
                onClick={() => handleSelectMol(mol)}
              >
                {mol.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Buton jos pt revenire la landing */}
        <div>
          <hr className="my-2 border-purple-300" />
          <button
            onClick={handleGoLanding}
            className="w-full text-left px-3 py-2 rounded-md transition-all bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium"
          >
            &larr; Go to Landing
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

        {/* LANDING */}
        {viewMode === "landing" && !selectedMol && (
          <ChemistryLanding />
        )}

        {/* UPLOAD FORM */}
        {viewMode === "upload" && (
          <ChemistryAddForm
            onCreateSuccess={onCreateSuccess}
            onError={onError}
          />
        )}

        {/* DETAIL */}
        {viewMode === "detail" && selectedMol && (
          <div className="p-4 border rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-2">
              {selectedMol.name} ({selectedMol.formula})
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Description:</strong> {selectedMol.description}
            </p>
            <p className="text-sm text-gray-700 mb-2 overflow-auto max-h-32 border p-2 rounded">
              <strong>MolFile:</strong>
              <br />
              <pre>{selectedMol.molFile}</pre>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
