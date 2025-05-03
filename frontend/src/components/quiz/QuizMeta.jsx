import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const QuizMeta = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [meta, setMeta] = useState({
    id: "",
    title: "",
    class_id: "",
    questions: 0,
    max_points: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const readError = async (r) =>
    typeof r.text === "function" ? await r.text() : String(r);

  useEffect(() => {
    (async () => {
      try {
        const rMeta = await fetch(
          `http://localhost:8000/evaluation/quiz/meta/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!rMeta.ok) throw new Error(await readError(rMeta));
        const raw = await rMeta.json();

        const qs = Array.isArray(raw.questions) ? raw.questions : [];
        const totalPoints = qs.reduce((sum, q) => sum + (q.points || 1), 0);

        setMeta({
          id: raw.id,
          title: raw.title,
          class_id: raw.class_id,
          questions: qs.length,
          max_points: totalPoints,
        });

        const rRes = await fetch(
          `http://localhost:8000/user/quiz/results/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (rRes.ok) {
          const resRaw = await rRes.json();
          setResult({
            score: resRaw.score,
            timestamp: resRaw.timestamp,
          });
        }
      } catch (e) {
        setError(e.message || "Eroare necunoscută");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, token]);

  if (loading)
    return <p className="text-center mt-12 text-mulberry">Se încarcă…</p>;
  if (error)
    return (
      <p className="text-center mt-12 text-red-600 whitespace-pre-wrap">
        {error}
      </p>
    );

  // Dacă nu există rezultat sau max_points e zero, pct rămâne null
  const pct =
    result && meta.max_points > 0
      ? Math.round((result.score / meta.max_points) * 100)
      : null;

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed]">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md border border-mulberry space-y-6">
        <h1 className="text-2xl font-bold text-mulberry">{meta.title}</h1>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-semibold">ID Quiz:</span> {meta.id}
          </p>
          <p>
            <span className="font-semibold">ID Clasă:</span>{" "}
            <Link
              to={`/classes/${meta.class_id}`}
              className="text-purple-700 hover:underline"
            >
              {meta.class_id}
            </Link>
          </p>
          <p>
            <span className="font-semibold">Întrebări:</span> {meta.questions}
          </p>
          <p>
            <span className="font-semibold">Punctaj maxim:</span>{" "}
            {meta.max_points}
          </p>
        </div>

        {result ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-lg font-semibold text-green-700">
              Ultimul scor obținut:
            </p>
            <p className="text-3xl font-bold text-green-800 flex items-baseline space-x-2">
              <span>
                {result.score} / {meta.max_points}
              </span>
              {pct !== null && (
                <span className="text-xl font-medium text-green-600">
                  ({pct}%)
                </span>
              )}
            </p>
            {result.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(result.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="italic text-gray-500">
            Nu ai susținut încă acest quiz.
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-200 text-mulberry px-4 py-2 rounded-md hover:bg-purple-300 transition text-sm"
          >
            ⬅ Înapoi
          </button>
          <button
            onClick={() => navigate(`/quiz/attempt/${quizId}`)}
            className="bg-gradient-to-r from-pink-500 to-mulberry text-white px-4 py-2 rounded-md hover:opacity-90 transition text-sm"
          >
            {result ? "Reia quiz-ul" : "Începe quiz-ul"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizMeta;
