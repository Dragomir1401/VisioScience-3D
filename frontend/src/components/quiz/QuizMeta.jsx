import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const log = (...args) => console.debug("[QuizMeta]", ...args);

const QuizMeta = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [meta, setMeta]     = useState({ questions: 0, maxPoints: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const normalize = (raw) => {
    const qs = Array.isArray(raw.questions) ? raw.questions : [];
    return {
      id:        raw.id         || quizId,
      title:     raw.title      || "(Fără titlu)",
      classId:   raw.class_id   || "-",
      questions: qs.length,
      maxPoints: qs.reduce((sum, q) => sum + (q.points || 1), 0),
    };
  };

  const readError = async (resp) =>
    typeof resp.text === "function" ? await resp.text() : String(resp);

  useEffect(() => {
    (async () => {
      log("Fetching meta & last-result for quiz", quizId);
      try {
        const rMeta = await fetch(
          `http://localhost:8000/evaluation/quiz/meta/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log("GET /quiz/meta status", rMeta.status);
        if (!rMeta.ok) {
          throw new Error(await readError(rMeta));
        }
        const metaRaw = await rMeta.json();
        log("META response", metaRaw);
        setMeta(normalize(metaRaw));

        const rRes = await fetch(
          `http://localhost:8000/evaluation/quiz/${quizId}/result/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log("GET /quiz/result status", rRes.status);
        if (rRes.ok) {
          const resJSON = await rRes.json();
          log("RESULT response", resJSON);
          setResult(resJSON);
        } else if (rRes.status !== 404) {
          throw new Error(await readError(rRes));
        }
      } catch (e) {
        log("Caught error", e);
        setError(e.message || "Eroare necunoscută");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, token, userId]);

  if (loading)
    return <p className="text-center mt-12 text-mulberry">Se încarcă…</p>;
  if (error)
    return (
      <p className="text-center mt-12 text-red-600 whitespace-pre-wrap">
        {error}
      </p>
    );

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
              to={`/classes/${meta.classId}`}
              className="text-purple-700 hover:underline"
            >
              {meta.classId}
            </Link>
          </p>
          <p>
            <span className="font-semibold">Întrebări:</span> {meta.questions}
          </p>
          <p>
            <span className="font-semibold">Punctaj maxim:</span>{" "}
            {meta.maxPoints}
          </p>

          {result ? (
            <p className="text-green-700">
              Ultimul scor obținut: <b>{result.score}</b> / {meta.maxPoints}
            </p>
          ) : (
            <p className="italic text-gray-500">
              Nu ai susținut încă acest quiz.
            </p>
          )}
        </div>

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
