import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClassActions from "./ClassActions";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorStudents, setErrorStudents] = useState("");
  const [errorQuizzes, setErrorQuizzes] = useState("");

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
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
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
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setErrorQuizzes("Eroare la încărcarea quiz-urilor.");
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi această clasă?")) return;
    try {
      const res = await fetch(`http://localhost:8000/user/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      navigate("/profile");
    } catch {
      alert("Eroare la ștergerea clasei.");
    }
  };

  const toggleQuizStatus = async (quizId, currentStatus, e) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:8000/evaluation/quiz/${quizId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_open: !currentStatus }),
      });
      fetchClassQuizzes();
    } catch {
      console.error("Eroare la actualizarea statusului quiz-ului");
    }
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm("Ești sigur că vrei să ștergi acest quiz?")) return;
    try {
      const res = await fetch(`http://localhost:8000/evaluation/quiz/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchClassQuizzes();
    } catch {
      alert("Eroare la ștergerea quiz-ului.");
    }
  };

  const studentList = Array.isArray(students) ? students : [];
  const quizList = Array.isArray(quizzes) ? quizzes : [];

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

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/classes/${id}/quiz/create`)}
            className="inline-block bg-mulberry text-white px-4 py-2 rounded-lg hover:bg-purple transition text-sm"
          >
            Creează quiz
          </button>
          <button
            onClick={handleDelete}
            className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Șterge clasa
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
          ) : studentList.length === 0 ? (
            <p className="italic text-gray-500">Niciun elev înscris.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              {studentList.map((s) => (
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
          ) : quizList.length === 0 ? (
            <p className="italic text-gray-500">Niciun quiz atribuit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizList.map((quiz) => (
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
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md border-2
                        ${quiz.is_open
                          ? "bg-gradient-to-r from-rose-500 to-red-500 text-white border-rose-400 hover:from-rose-600 hover:to-red-600"
                          : "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-emerald-400 hover:from-emerald-500 hover:to-green-600"
                        }`}
                      title={quiz.is_open ? "Închide quiz" : "Deschide quiz"}
                    >
                      {quiz.is_open ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg>
                          Închide quiz
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2zm6-6V7a6 6 0 10-12 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg>
                          Deschide quiz
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                      className="flex-1 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-600 transition flex items-center justify-center gap-2 shadow-md border-2 border-rose-400"
                      title="Șterge quiz"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      Șterge
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
