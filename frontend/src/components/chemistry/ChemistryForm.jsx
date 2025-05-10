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
      setError(err.message);
      onError && onError(err.message);
    }
  }

  const inputClass =
    "w-full px-4 py-2 text-sm text-black bg-white/90 border border-mulberry rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mulberry";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf4ff] via-[#f3e8ff] to-[#fff7ed] space-y-10 pt-10">
      <div className="relative w-full max-w-md mt-12 z-10">
        <div className="p-8 rounded-2xl border-2 border-mulberry shadow-[6px_6px_0px_#DA70D6] bg-white/90">
          <h2 className="text-2xl font-bold mb-6 text-mulberry font-poppins text-center">
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
          <form onSubmit={handleSubmit} className="space-y-4 font-worksans">
            <div className="flex gap-4 text-sm text-black">
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
              className={inputClass}
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="formula"
              placeholder="Formulă chimică"
              className={inputClass}
              value={formData.formula}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Descriere"
              rows={2}
              className={inputClass}
              value={formData.description}
              onChange={handleChange}
            />
            {uploadMode === "file" ? (
              <div>
                <input
                  type="file"
                  accept=".mol"
                  onChange={handleFileChange}
                  className="text-sm text-black"
                />
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
                className={inputClass}
                value={formData.molFile}
                onChange={handleChange}
              />
            )}
            <button
              type="submit"
              className="w-full py-2 mt-4 bg-mulberry text-white font-semibold rounded-md hover:bg-[#2C0E37] transition"
            >
              Încarcă molecula
            </button>
          </form>
        </div>
      </div>
      <div className="w-full max-w-md flex justify-center mt-2">
        <div className="w-full h-[300px]">
          <Canvas camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 5] }}>
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[1, 2, 1]} intensity={3} />
              <ChemistryBaloon
                isTyping={isTyping}
                uploadSuccess={uploadSuccess}
                position={[0, -1.5, 0]}
                scale={[0.65, 0.65, 0.65]}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default ChemistryAddForm;
