import React, { useState } from "react";

const ChemistryAddForm = ({ onCreateSuccess, onError }) => {
  const [uploadMode, setUploadMode] = useState("file");
  const [formData, setFormData] = useState({
    name: "",
    formula: "",
    description: "",
    molFile: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        setFormData({ ...formData, molFile: text });
      } catch (err) {
        console.error(err);
        setError("Failed to read .mol file");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.name || !formData.molFile) {
      setError("Name și MolFile sunt obligatorii!");
      onError && onError("Name și MolFile obligatorii");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/feed/chem/molecules", {
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

      // Cleanup
      setFormData({ name: "", formula: "", description: "", molFile: "" });
      onCreateSuccess && onCreateSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message);
      onError && onError(err.message);
    }
  }

  return (
    <div className="max-w-md bg-white p-4 border rounded shadow space-y-3">
      <h2 className="text-lg font-semibold">Add New Molecule</h2>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

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

      {/* Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          className="border w-full p-2"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      {/* Formula */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Formula</label>
        <input
          type="text"
          name="formula"
          className="border w-full p-2"
          value={formData.formula}
          onChange={handleChange}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
          className="border w-full p-2"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* MolFile */}
      {uploadMode === "file" ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium">MolFile Upload</label>
          <input type="file" accept=".mol" onChange={handleFileChange} />
          {formData.molFile && (
            <p className="text-sm text-gray-500 border p-1 rounded">
              {formData.molFile.substring(0, 80)}...
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Paste MolFile text</label>
          <textarea
            name="molFile"
            rows={4}
            className="border w-full p-2"
            value={formData.molFile}
            onChange={handleChange}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="bg-purple-700 text-white px-4 py-2 rounded"
      >
        Add Molecule
      </button>
    </div>
  );
};

export default ChemistryAddForm;
