import React, { useState } from "react";

const ClassActions = ({ classId, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");

  const handleAddStudent = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${classId}/add-student`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Eroare la adăugare.");
      }

      setStatus("Elev adăugat cu succes!");
      setEmail("");
      onSuccess && onSuccess(); // Reîncarcă elevii
    } catch (err) {
      setStatus(err.message);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Sigur vrei să elimini acest elev?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${classId}/students/${studentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Eroare la eliminarea elevului.");

      setStudents((prev) => prev.filter((s) => s.ID !== studentId));
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 p-4 rounded-md mt-6">
      <h4 className="font-semibold text-purple-700 mb-2">
        Adaugă elev în clasă
      </h4>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Email elev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm border-mulberry focus:outline-none"
        />
        <button
          onClick={handleAddStudent}
          className="bg-mulberry text-white px-4 py-2 rounded-md hover:bg-purple transition"
        >
          Adaugă
        </button>
      </div>
      {status && <p className="text-sm mt-2 text-mulberry">{status}</p>}
    </div>
  );
};

export default ClassActions;
