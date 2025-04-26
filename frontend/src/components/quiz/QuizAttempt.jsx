/*  src/components/quiz/QuizAttempt.jsx  */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const log = (...a) => console.debug("[QuizAttempt]", ...a);

const QuizAttempt = () => {
  const { quizId } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null); // { title, questions:[{…}] }
  const [answers, setAnswers] = useState([]); // [null | idx, …]
  const [stage, setStage] = useState("loading"); // loading | ready | sent
  const [error, setError] = useState("");

  /* ------------ 1. LOAD QUIZ (no answers) ----------------------------- */
  useEffect(() => {
    (async () => {
      try {
        log("GET quiz attempt payload");
        const r = await fetch(
          `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!r.ok) {
          throw new Error(`${r.status} – ${await r.text()}`);
        }
        const data = await r.json();

        // fallback defensiv
        const safeQ = Array.isArray(data?.questions) ? data.questions : [];
        setQuiz({ title: data?.title || "(Fără titlu)", questions: safeQ });
        setAnswers(Array(safeQ.length).fill(null));
        setStage("ready");
      } catch (e) {
        log("Fetch error", e);
        setError(e.message);
      }
    })();
  }, [quizId, token]);

  /* ------------ 2. HANDLERS ------------------------------------------ */
  const choose = (qIdx, cIdx) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = cIdx;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      alert("Răspunde la toate întrebările înainte de trimitere!");
      return;
    }

    try {
      const r = await fetch(
        `http://localhost:8000/evaluation/quiz/${quizId}/attempt`,
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

  /* ------------ 3. RENDER -------------------------------------------- */
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
            key={i}
            className="bg-white p-5 rounded-xl border border-mulberry shadow"
          >
            <p className="font-semibold text-purple-800">
              {i + 1}. {q.text}
            </p>

            {Array.isArray(q.images) && q.images.length > 0 && (
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
            className="bg-gradient-to-r from-mulberry to-pink-500 text-white
                       px-6 py-2 rounded-md hover:opacity-90"
          >
            Trimite răspunsurile
          </button>
        ) : (
          <button
            onClick={() => nav(-1)}
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
