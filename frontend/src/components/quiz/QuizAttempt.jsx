/*  src/components/quiz/QuizAttempt.jsx  */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const dbg = (...a) => console.debug("[QuizAttempt]", ...a);

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [stage, setStage] = useState("loading");
  const [error, setError] = useState("");

  /* ---------- 1. Încărcăm quizul (fără răspunsuri corecte) --------- */
  useEffect(() => {
    (async () => {
      try {
        dbg("GET /evaluation/quiz/attempt/", quizId);
        const r = await fetch(
          `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error(`${r.status} – ${await r.text()}`);

        const raw = await r.json();

        // --- normalizare camelCase ----------------------------------
        const quizData = {
          title: raw.Title,
          questions: (raw.Questions || []).map((q) => ({
            id: q.ID,
            text: q.Text,
            choices: q.Choices ?? [],
            images: q.Images ?? [],
            points: q.Points ?? 1,
          })),
        };
        //--------------------------------------------------------------

        setQuiz(quizData);
        setAnswers(Array(quizData.questions.length).fill(null));
        setStage("ready");
      } catch (e) {
        dbg("Fetch error:", e);
        setError(e.message);
      }
    })();
  }, [quizId, token]);

  /* ---------- 2. Handlers ----------------------------------------- */
  const choose = (qIdx, cIdx) =>
    setAnswers((prev) => {
      const cp = [...prev];
      cp[qIdx] = cIdx;
      return cp;
    });

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Răspunde la toate întrebările înainte de trimitere!");
      return;
    }

    try {
      const r = await fetch(
        `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        }
      );
      if (!r.ok) throw new Error(`${r.status} – ${await r.text()}`);

      const { score } = await r.json();
      setStage("sent");
      alert(`Felicitări! Ai obţinut ${score} puncte.`);
    } catch (e) {
      alert(`Eroare la trimitere: ${e.message}`);
    }
  };

  /* ---------- 3. Render ------------------------------------------- */
  if (stage === "loading")
    return <p className="pt-24 text-center text-mulberry">Se încarcă…</p>;

  if (error)
    return (
      <p className="pt-24 text-center text-red-600 whitespace-pre-wrap">
        {error}
      </p>
    );

  if (!quiz) return null;

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed]">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-mulberry">{quiz.title}</h1>

        {quiz.questions.map((q, i) => (
          <div
            key={q.id ?? i}
            className="bg-white p-5 rounded-xl border border-mulberry shadow"
          >
            <p className="font-semibold text-purple-800">
              {i + 1}. {q.text}
            </p>

            {!!q.images.length && (
              <div className="my-2 flex flex-wrap gap-2">
                {q.images.map((src, k) => (
                  <img
                    key={k}
                    src={src}
                    alt=""
                    className="h-32 object-contain border"
                  />
                ))}
              </div>
            )}

            <ul className="mt-2 space-y-1">
              {q.choices.map((c, j) => (
                <li key={j} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={answers[i] === j}
                    onChange={() => choose(i, j)}
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {stage !== "sent" ? (
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-mulberry to-pink-500
                       text-white px-6 py-2 rounded-md hover:opacity-90"
          >
            Trimite răspunsurile
          </button>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-200 text-mulberry px-6 py-2 rounded-md"
          >
            ⬅ Înapoi
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;
