import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClasses(data);
    } catch {
      setError("Eroare la încărcarea claselor.");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/user/classes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newClassName }),
      });

      if (!res.ok) throw new Error(await res.text());
      setNewClassName("");
      setMessage("Clasa a fost creată!");
      fetchClasses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoToClass = (cls) => {
    navigate(`/classes/${cls.ID}`);
  };

  return (
    <div className="mt-10 px-4 max-w-4xl mx-auto space-y-10">
      {/* Lista clase */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
        <h3 className="text-lg font-semibold text-mulberry mb-4">
          Clasele tale
        </h3>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-500">Nu ai creat nicio clasă încă.</p>
        ) : (
          <ul className="space-y-3">
            {classes.map((cls) => (
              <li
                key={cls.ID}
                onClick={() => handleGoToClass(cls)}
                className="p-4 bg-purple-50 border border-purple-200 rounded shadow-sm cursor-pointer hover:bg-purple-100 transition"
              >
                <div className="font-semibold text-purple-800">{cls.Name}</div>
                <div className="text-sm text-gray-600">
                  Cod înscriere: <code className="font-mono">{cls.Code}</code>
                </div>
                <div className="text-sm text-gray-600">
                  Elevi înscriși: {cls.Students?.length ?? 0}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Form creare clasă */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
        <h3 className="text-lg font-semibold text-mulberry mb-4">
          Creează o clasă nouă
        </h3>
        <form onSubmit={handleCreateClass} className="flex gap-4">
          <input
            type="text"
            placeholder="ex: 11B"
            className="flex-1 px-3 py-2 border rounded-md border-mulberry focus:outline-none focus:ring-2 focus:ring-mulberry"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-mulberry text-white rounded-md hover:bg-purple transition"
          >
            Creează
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default TeacherDashboard;
