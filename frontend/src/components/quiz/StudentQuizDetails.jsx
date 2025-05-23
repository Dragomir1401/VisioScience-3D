// src/components/quiz/StudentQuizDetails.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentQuizDetails = ({ classId }) => {
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [data, setData]   = useState([]);
  const [load, setLoad]   = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        const qRes = await fetch(
          `http://localhost:8000/evaluation/quiz/class/${classId}`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        if (!qRes.ok) throw new Error(await qRes.text());
        const quizzes = await qRes.json();
        if (!Array.isArray(quizzes) || quizzes.length === 0) {
          setData([]);
          return;
        }
        const combined = await Promise.all(
          quizzes.map(async (q) => {
            let last_score = null;
            try {
              const r = await fetch(
                `http://localhost:8000/evaluation/quiz/${q.id}/result/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (r.ok) {
                const { score } = await r.json();
                last_score = score ?? null;
              }
            } catch {}
            return {
              id:         q.id,
              title:      q.title,
              last_score,
              is_open:    q.is_open, 
            };
          })
        );
        setData(combined);
      } catch (e) {
        setError("Eroare la încărcarea quiz-urilor.");
      } finally {
        setLoad(false);
      }
    })();
  }, [classId, token, userId]);

  if (load)   return <p className="text-sm text-gray-500">Se încarcă…</p>;
  if (error)  return <p className="text-red-600 text-sm">{error}</p>;
  if (data.length === 0)
    return <p className="text-sm italic text-gray-500">Nu există quiz-uri încă.</p>;

  return (
    <ul className="space-y-3 text-sm">
      {data.map((q) => (
        <li key={q.id} className="flex items-center justify-between">
          <div className="flex-1">
            {q.is_open ? (
              <Link
                to={`/quiz/meta/${q.id}`}
                className="text-mulberry font-medium hover:underline"
              >
                {q.title}
              </Link>
            ) : (
              <span className="text-gray-400 font-medium">{q.title}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {q.last_score !== null ? (
              <span className="text-green-700">Scor: {q.last_score}</span>
            ) : (
              <span className="text-gray-400 italic">Neînceput</span>
            )}
            <Link
              to={`/quiz/attempt/${q.id}`}
              className={`px-3 py-1 rounded-md text-xs text-white transition ${
                q.is_open
                  ? "bg-gradient-to-r from-pink-500 to-mulberry hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={e => {
                if (!q.is_open) e.preventDefault();
              }}
            >
              {q.is_open ? "Rezolvă quiz" : "Quiz închis"}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default StudentQuizDetails;
