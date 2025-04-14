import React, { useState } from "react";

const ClassActions = ({ classId, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");

  const handleInviteStudent = async () => {
    setStatus("");
    console.log("Class ID primit:", classId);

    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${classId}/invite`,
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
        throw new Error(result.message || "Eroare la trimiterea invitației.");
      }

      setStatus("Invitație trimisă cu succes!");
      setEmail("");
      onSuccess && onSuccess();
    } catch (err) {
      setStatus("Eroare: " + err.message);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 p-4 rounded-md mt-6">
      <h4 className="font-semibold text-purple-700 mb-2">
        Invită un elev să se alăture clasei
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
          onClick={handleInviteStudent}
          className="bg-mulberry text-white px-4 py-2 rounded-md hover:bg-purple transition"
        >
          Trimite invitație
        </button>
      </div>
      {status && <p className="text-sm mt-2 text-mulberry">{status}</p>}
    </div>
  );
};

export default ClassActions;
