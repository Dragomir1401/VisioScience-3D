import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import ChemistryBaloon from "../../models/chemistry/ChemistryBaloon";
import Loader from "../Loader";

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
  const [isTyping, setIsTyping] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 300);
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
    setUploadSuccess(false);

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
      setMessage(`Molecula a fost creată! ID: ${data.id}`);
      setUploadSuccess(true);

      setTimeout(() => {
        setFormData({ name: "", formula: "", description: "", molFile: "" });
        setUploadSuccess(false);
        onCreateSuccess && onCreateSuccess();
      }, 2000); 
    } catch (err) {
      console.error(err);
      setError(err.message);
      onError && onError(err.message);
    }
  }

  return (
    <div className="relative min-h-screen w-full h-full flex items-center justify-center bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100">
      {/* Balon 3D */}
      <div className="absolute top-0 w-full h-[300px] z-0 pointer-events-none">
        <Canvas camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[1, 2, 1]} intensity={3} />
            <ChemistryBaloon
              isTyping={isTyping}
              uploadSuccess={uploadSuccess}
              position={[0, -0.5, 0]}
              scale={[0.65, 0.65, 0.65]}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Formular */}
      <div className="relative z-10 bg-white p-8 rounded shadow-md w-full max-w-md mt-48">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">
          Adaugă o moleculă
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="uploadMode"
                value="file"
                checked={uploadMode === "file"}
                onChange={() => setUploadMode("file")}
              />
              Upload .mol
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="uploadMode"
                value="text"
                checked={uploadMode === "text"}
                onChange={() => setUploadMode("text")}
              />
              Paste mol text
            </label>
          </div>

          <input
            type="text"
            name="name"
            placeholder="Nume moleculă"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-400"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="formula"
            placeholder="Formulă chimică"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-400"
            value={formData.formula}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Descriere"
            rows={2}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-400"
            value={formData.description}
            onChange={handleChange}
          />

          {uploadMode === "file" ? (
            <div>
              <input type="file" accept=".mol" onChange={handleFileChange} />
              {formData.molFile && (
                <p className="text-sm mt-2 text-gray-500 border p-2 rounded max-h-32 overflow-auto">
                  {formData.molFile.slice(0, 100)}...
                </p>
              )}
            </div>
          ) : (
            <textarea
              name="molFile"
              rows={6}
              placeholder="Lipește conținutul .mol aici"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-400"
              value={formData.molFile}
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-purple-700 text-white 
                       rounded-md hover:bg-purple-800 transition"
          >
            Încarcă molecula
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChemistryAddForm;
