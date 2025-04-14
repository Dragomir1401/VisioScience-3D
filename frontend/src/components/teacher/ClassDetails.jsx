import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClassActions from "./ClassActions";

const ClassDetails = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
  }, [id]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${id}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Eroare la încărcarea elevilor.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-20 bg-white rounded-xl shadow-md border border-purple-200 space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-mulberry">Detalii clasă</h2>
        <p className="text-gray-600 text-sm">
          ID clasă: <code className="font-mono">{id}</code>
        </p>
      </div>

      {/* Secțiune: Invită elevi */}
      <ClassActions classId={id} onSuccess={fetchStudents} />

      {/* Secțiune: Elevi */}
      <div>
        <h3 className="text-md font-semibold text-purple-700 mb-2">
          Elevi înscriși
        </h3>

        {loading ? (
          <p className="text-sm text-gray-500">Se încarcă elevii...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-sm italic text-gray-500">
            Niciun elev înscris încă.
          </p>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {students.map((student) => (
              <li key={student.id}>
                {student.email}{" "}
                <span className="text-gray-500">(ID: {student.id})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QuizList />
    </div>
  );
};

const QuizList = () => (
  <div>
    <h3 className="text-md font-semibold text-purple-700 mb-2">
      Quiz-uri atribuite
    </h3>
    <p className="text-sm italic text-gray-500">
      Momentan nu există quiz-uri. Funcționalitate în curs de dezvoltare.
    </p>
  </div>
);

export default ClassDetails;
