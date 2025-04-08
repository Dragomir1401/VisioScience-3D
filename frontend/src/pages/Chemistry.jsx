import React, { useEffect, useState } from "react";

const Chemistry = () => {
  // Stocăm lista de molecule
  const [molecules, setMolecules] = useState([]);
  // Molecula selectată din side menu
  const [selectedMol, setSelectedMol] = useState(null);

  // Formular: mod upload ("file" | "text")
  const [uploadMode, setUploadMode] = useState("file");
  // Date formular (nume, formula, description, molFile)
  const [formData, setFormData] = useState({
    name: "",
    formula: "",
    description: "",
    molFile: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // La montare, încărcăm moleculele
  useEffect(() => {
    fetchMolecules();
  }, []);

  // --- Fetch molecules list ---
  async function fetchMolecules() {
    try {
      setError("");
      setMessage("");
      const res = await fetch("http://localhost:8080/feed/chem/molecules");
      if (!res.ok) {
        throw new Error(`Fetch molecules error: ${res.status}`);
      }
      const data = await res.json();
      setMolecules(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch molecules");
    }
  }

  // --- Select molecule from side menu ---
  function handleSelectMol(mol) {
    setSelectedMol(mol);
    setMessage("");
    setError("");
  }

  // --- Când userul scrie în inputurile text / textarea ---
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // --- Când userul selectează fișier .mol ---
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        // stocăm conținutul fișierului direct în formData.molFile
        setFormData({ ...formData, molFile: text });
      } catch (err) {
        console.error(err);
        setError("Failed to read file");
      }
    }
  }

  // --- Creare moleculă (POST) ---
  async function handleAddMolecule(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name || !formData.molFile) {
      setError("Name și MolFile sunt obligatorii.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/feed/chem/molecules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      const data = await res.json();
      setMessage(`Molecule created with id: ${data.id}`);
      // Reset form
      setFormData({ name: "", formula: "", description: "", molFile: "" });
      // Re-încarcă lista
      fetchMolecules();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <div className="flex">
      {/* --- Side Menu (lista molecule) --- */}
      <aside
        className="w-64 min-h-screen p-4 shadow-md 
          bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100 
          text-purple-800 rounded-r-lg"
      >
        <h2 className="text-xl font-bold mb-4">Molecule List</h2>
        <ul className="space-y-2">
          {molecules.map((mol) => (
            <li
              key={mol.id}
              className={`cursor-pointer px-3 py-2 rounded-md transition-all ${
                selectedMol?.id === mol.id
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-300"
              }`}
              onClick={() => handleSelectMol(mol)}
            >
              {mol.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-bold">Chemistry Page</h1>

        {/* --- If there's a selected molecule, show details --- */}
        {selectedMol && (
          <div className="p-4 border rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-2">
              {selectedMol.name} ({selectedMol.formula})
            </h2>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Description: </strong>
              {selectedMol.description}
            </p>
            <p className="text-sm text-gray-700 mb-2 overflow-auto max-h-32 border">
              <strong>MolFile:</strong>
              <br />
              <pre>{selectedMol.molFile}</pre>
            </p>
          </div>
        )}

        {/* --- Formular de adăugare molecule --- */}
        <div className="max-w-md bg-white p-4 border rounded shadow space-y-3">
          <h2 className="text-lg font-semibold">Add New Molecule</h2>
          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}

          {/* Upload mode toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="uploadMode"
                value="file"
                checked={uploadMode === "file"}
                onChange={() => setUploadMode("file")}
              />
              <span>Upload .mol file</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="uploadMode"
                value="text"
                checked={uploadMode === "text"}
                onChange={() => setUploadMode("text")}
              />
              <span>Paste molFile text</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="border w-full p-2"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Formula</label>
            <input
              type="text"
              name="formula"
              className="border w-full p-2"
              value={formData.formula}
              onChange={(e) => {
                setFormData({ ...formData, formula: e.target.value });
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={2}
              className="border w-full p-2"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
            />
          </div>

          {/* .mol file input */}
          {uploadMode === "file" ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                MolFile Upload
              </label>
              <input type="file" accept=".mol" onChange={handleFileChange} />
              {formData.molFile && (
                <p className="text-sm text-gray-500">
                  {formData.molFile.substring(0, 40)}...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Paste MolFile text
              </label>
              <textarea
                name="molFile"
                rows={4}
                className="border w-full p-2"
                value={formData.molFile}
                onChange={(e) => {
                  setFormData({ ...formData, molFile: e.target.value });
                }}
              />
            </div>
          )}

          <button
            onClick={handleAddMolecule}
            className="bg-purple-700 text-white px-4 py-2 rounded"
          >
            Add Molecule
          </button>
        </div>
      </main>
    </div>
  );
};

export default Chemistry;
