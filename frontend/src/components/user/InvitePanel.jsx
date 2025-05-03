import React, { useEffect, useState } from "react";

const InvitesPanel = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Eroare la încărcarea invitațiilor.");
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  const respondToInvite = async (inviteId, accept) => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/invites/${inviteId}/respond`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accept }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      fetchInvites();
    } catch (err) {
      alert("Eroare: " + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200 w-full max-w-2xl mt-6">
      {loading ? (
        <p className="text-sm text-gray-500">Se încarcă invitațiile...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : invites.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Nu ai nicio invitație nouă.
        </p>
      ) : (
        <ul className="space-y-4">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="border border-purple-100 bg-purple-50 p-4 rounded shadow-sm"
            >
              <p className="text-sm text-gray-700 mb-2">
                Ai fost invitat să te alături clasei cu ID-ul{" "}
                <code className="font-mono text-purple-700">
                  {invite.class_id}
                </code>{" "}
                de către profesorul cu ID{" "}
                <code className="font-mono text-purple-700">
                  {invite.sender_id}
                </code>
                .
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => respondToInvite(invite.id, true)}
                  className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                >
                  Acceptă
                </button>
                <button
                  onClick={() => respondToInvite(invite.id, false)}
                  className="px-4 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Refuză
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvitesPanel;
