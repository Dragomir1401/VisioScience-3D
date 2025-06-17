// src/components/quiz/StudentQuizDetails.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentQuizDetails = ({ classId }) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
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
            let result = null;
            try {
              const r = await fetch(
                `http://localhost:8000/evaluation/quiz/${q.id}/result/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (r.ok) {
                const data = await r.json();
                result = {
                  score: data.score ?? null,
                  points: data.points ?? null,
                  perfectScore: data.perfect_score ?? false,
                  streakBonus: data.streak_bonus ?? 0,
                  timeBonus: data.time_bonus ?? 0,
                };
              }
            } catch {}

            const calculatedMaxPoints = (q.questions || []).reduce(
              (sum, question) => sum + (question.points || 0),
              0
            );

            return {
              id: q.id,
              title: q.title,
              result,
              is_open: q.is_open,
              difficulty: q.difficulty || "medium",
              category: q.category || "general",
              maxPoints: calculatedMaxPoints,
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

  if (load) return <p className="text-sm text-gray-500">Se încarcă…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (data.length === 0)
    return (
      <p className="text-sm italic text-gray-500">Nu există quiz-uri încă.</p>
    );

  return (
    <ul className="space-y-3 text-sm">
      {data.map((q) => (
        <li key={q.id} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
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
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {q.difficulty}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                {q.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {q.result ? (
              <div className="text-right">
                <div className="text-green-700">
                  {q.result.score !== null ? (
                    <>
                      <div>
                        Scor: {Math.min(q.result.score, q.maxPoints)} /{" "}
                        {q.maxPoints}
                      </div>
                      {q.result.points > q.result.score && (
                        <div className="text-xs text-green-600 space-y-0.5">
                          {q.result.perfectScore && <span>✨ Perfect</span>}
                          {q.result.streakBonus > 0 && (
                            <span>🔥 +{q.result.streakBonus}</span>
                          )}
                          {q.result.timeBonus > 0 && (
                            <span>⚡ +{q.result.timeBonus}</span>
                          )}
                          <div className="font-semibold">
                            Total cu bonus: {q.result.points}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">În curs de evaluare</span>
                  )}
                </div>
              </div>
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
              onClick={(e) => {
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
