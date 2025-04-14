import React, { useEffect, useState } from "react";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClasses(data || []);
    } catch (err) {
      setError("Eroare la încărcarea claselor.");
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 204) {
        // no content, listă goală
        setStudentsInClass([]);
        return;
      }

      const data = await res.json();
      setStudentsInClass(data || []);
    } catch (err) {
      setStudentsInClass([]);
      setError("Eroare la încărcarea elevilor.");
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

  const handleClassClick = (cls) => {
    if (selectedClassId === cls.ID) {
      setSelectedClassId(null);
      setStudentsInClass([]);
    } else {
      setSelectedClassId(cls.ID);
      fetchStudents(cls.ID);
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-purple-200">
      <h3 className="text-lg font-semibold text-mulberry mb-4">Clasele tale</h3>

      <form onSubmit={handleCreateClass} className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Nume clasă ex: 10B"
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

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
      {classes.length === 0 && (
        <p className="text-sm text-gray-500">Nu ai creat nicio clasă încă.</p>
      )}

      <ul className="space-y-3">
        {classes.map((cls) => (
          <li
            key={cls.ID}
            onClick={() => handleClassClick(cls)}
            className="p-4 bg-purple-50 border border-purple-200 rounded shadow-sm cursor-pointer hover:bg-purple-100 transition"
          >
            <div className="font-semibold text-purple-800">{cls.Name}</div>
            <div className="text-sm text-gray-600">
              Cod înscriere: <code className="font-mono">{cls.Code}</code>
            </div>
            <div className="text-sm text-gray-600">
              Elevi înscriși: {cls.Students?.length ?? 0}
            </div>

            {selectedClassId === cls.ID && (
              <div className="mt-4 space-y-1">
                <h4 className="font-medium text-sm text-mulberry">
                  Elevi înscriși:
                </h4>
                {studentsInClass.length === 0 ? (
                  <p className="text-sm italic text-gray-500">
                    Niciun elev înscris momentan.
                  </p>
                ) : (
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {studentsInClass.map((student) => (
                      <li key={student.ID}>
                        {student.Email}{" "}
                        <span className="text-gray-500">
                          (ID: {student.ID})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;
