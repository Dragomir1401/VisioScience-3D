import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClassActions from "./ClassActions";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorStudents, setErrorStudents] = useState("");
  const [errorQuizzes, setErrorQuizzes] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
    fetchClassQuizzes();
  }, [id]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${id}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorStudents("Eroare la încărcarea elevilor.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassQuizzes = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/evaluation/quiz/class/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log("Quizzes:", data);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorQuizzes("Eroare la încărcarea quiz-urilor.");
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-md border border-mulberry">
          <div>
            <h2 className="text-2xl font-bold text-mulberry">Detalii clasă</h2>
            <p className="text-gray-600 text-sm mt-1">
              ID clasă: <code className="font-mono">{id}</code>
            </p>
          </div>
          <button
            onClick={() => navigate(`/classes/${id}/quiz/create`)}
            className="bg-mulberry text-white px-4 py-2 rounded-md hover:bg-purple transition text-sm"
          >
            Creează quiz
          </button>
        </div>

        {/* Acțiuni - invitații etc */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <ClassActions classId={id} onSuccess={fetchStudents} />
        </div>

        {/* Elevi */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-md font-semibold text-purple-700 mb-3">
            Elevi înscriși
          </h3>
          {loadingStudents ? (
            <p className="text-sm text-gray-500">Se încarcă elevii...</p>
          ) : errorStudents ? (
            <p className="text-red-600 text-sm">{errorStudents}</p>
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

        {/* Quiz-uri */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-md font-semibold text-purple-700 mb-3">
            Quiz-uri atribuite
          </h3>
          {loadingQuizzes ? (
            <p className="text-sm text-gray-500">Se încarcă quiz-urile...</p>
          ) : errorQuizzes ? (
            <p className="text-red-600 text-sm">{errorQuizzes}</p>
          ) : quizzes.length === 0 ? (
            <p className="text-sm italic text-gray-500">
              Niciun quiz atribuit încă.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
              {quizzes.map((quiz) => (
                <li key={quiz.ID}>
                  <Link
                    to={`/quiz/${quiz.ID}`}
                    className="text-mulberry hover:underline"
                  >
                    {quiz.Title || "Quiz fără titlu"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
