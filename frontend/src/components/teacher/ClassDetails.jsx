// src/components/teacher/ClassDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClassActions from "./ClassActions";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes]   = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes]   = useState(true);
  const [errorStudents, setErrorStudents]     = useState("");
  const [errorQuizzes, setErrorQuizzes]       = useState("");

  useEffect(() => {
    fetchStudents();
    fetchClassQuizzes();
  }, [id]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${id}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setStudents(await res.json());
    } catch {
      setErrorStudents("Eroare la încărcarea elevilor.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch(
        `http://localhost:8000/evaluation/quiz/class/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setQuizzes(await res.json());
    } catch {
      setErrorQuizzes("Eroare la încărcarea quiz-urilor.");
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const toggleQuizStatus = async (quizId, currentStatus, e) => {
    e.stopPropagation();
    try {
      await fetch(
        `http://localhost:8000/evaluation/quiz/${quizId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_open: !currentStatus }),
        }
      );
      fetchClassQuizzes();
    } catch {
      console.error("Eroare la actualizarea statusului quiz-ului");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/profile")}
          className="inline-block text-sm px-4 py-2 bg-gradient-to-r from-mulberry to-pink-500 text-white rounded-lg shadow hover:opacity-90 transition"
        >
          ⬅ Înapoi la profil
        </button>

        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-md border border-mulberry">
          <div>
            <h2 className="text-2xl font-bold text-mulberry">Detalii clasă</h2>
            <p className="text-gray-600 text-sm mt-1">
              ID clasă: <code className="font-mono">{id}</code>
            </p>
          </div>
          <button
            onClick={() => navigate(`/classes/${id}/quiz/create`)}
            className="inline-block bg-mulberry text-white px-4 py-2 rounded-lg hover:bg-purple transition text-sm"
          >
            Creează quiz
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <ClassActions classId={id} onSuccess={fetchStudents} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">
            Elevi înscriși
          </h3>
          {loadingStudents ? (
            <p className="text-gray-500">Se încarcă elevii…</p>
          ) : errorStudents ? (
            <p className="text-red-600">{errorStudents}</p>
          ) : students.length === 0 ? (
            <p className="italic text-gray-500">Niciun elev înscris.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              {students.map((s) => (
                <li key={s.id}>
                  {s.email} <span className="text-gray-500">(ID: {s.id})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">
            Quiz-uri atribuite
          </h3>
          {loadingQuizzes ? (
            <p className="text-gray-500">Se încarcă quiz-urile…</p>
          ) : errorQuizzes ? (
            <p className="text-red-600">{errorQuizzes}</p>
          ) : quizzes.length === 0 ? (
            <p className="italic text-gray-500">Niciun quiz atribuit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() =>
                    navigate(`/classes/${id}/quiz/${quiz.id}/results`)
                  }
                  className="bg-white p-6 rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-xl transition"
                >
                  <h4 className="text-xl font-bold text-mulberry mb-4">
                    <Link
                      to={`/quiz/${quiz.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {quiz.title || "Quiz fără titlu"}
                    </Link>
                  </h4>

                  <div className="mt-auto flex space-x-4">
                    <button
                      onClick={(e) =>
                        toggleQuizStatus(quiz.id, quiz.is_open, e)
                      }
                      className={`flex-1 py-2 rounded-lg text-sm transition ${
                        quiz.is_open
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {quiz.is_open ? "Închide quiz" : "Deschide quiz"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
