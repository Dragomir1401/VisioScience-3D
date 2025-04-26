import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StudentQuizDetails = ({ classId, userId, token }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // obţinem toate quiz-urile clasei
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/evaluation/quiz/class/${classId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        // pentru fiecare quiz cerem ultimul rezultat al elevului
        const withResults = await Promise.all(
          data.map(async (q) => {
            try {
              const r = await fetch(
                `http://localhost:8000/evaluation/quiz/${q.ID}/result/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (!r.ok) return { ...q, lastScore: null };
              const resData = await r.json();
              return { ...q, lastScore: resData.score };
            } catch {
              return { ...q, lastScore: null };
            }
          })
        );

        setQuizzes(withResults);
      } catch (err) {
        setError("Eroare la încărcarea quiz-urilor.");
      } finally {
        setLoading(false);
      }
    };

    if (classId) fetchQuizzes();
  }, [classId, userId, token]);

  if (loading) return <p className="text-sm text-gray-500">Se încarcă…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (quizzes.length === 0)
    return (
      <p className="text-sm italic text-gray-500">Nu există quiz-uri încă.</p>
    );

  return (
    <ul className="space-y-2 text-sm">
      {quizzes.map((q) => (
        <li key={q.ID} className="flex items-center justify-between">
          <Link
            to={`/quiz/${q.ID}`}
            className="text-mulberry hover:underline font-medium"
          >
            {q.Title || "Quiz fără titlu"}
          </Link>

          {q.lastScore !== null ? (
            <span className="text-green-700">Scor: {q.lastScore}</span>
          ) : (
            <span className="text-gray-400 italic">Neînceput</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default StudentQuizDetails;
