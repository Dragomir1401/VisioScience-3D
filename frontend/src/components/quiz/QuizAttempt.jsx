import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const dbg = (...a) => console.debug("[QuizAttempt]", ...a);

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz]         = useState(null);
  const [answers, setAnswers]   = useState([]);
  const [stage, setStage]       = useState("loading"); 
  const [error, setError]       = useState("");
  const [score, setScore]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        dbg("GET quiz for attempt", quizId);
        const r = await fetch(
          `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error(`${r.status} – ${await r.text()}`);
        const raw = await r.json();

        const questions = (raw.Questions || []).map((q) => ({
          id:      q.ID,
          text:    q.Text,
          choices: q.Choices || [],
          images:  q.Images  || [],
          points:  q.Points  || 1,
        }));

        setQuiz({ title: raw.Title, questions });
        setAnswers(Array(questions.length).fill(null));
        setStage("ready");
      } catch (e) {
        dbg("Fetch error:", e);
        setError(e.message);
      }
    })();
  }, [quizId, token]);

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

      const { score: sc } = await r.json();
      setScore(sc);
      setStage("sent");

      await fetch("http://localhost:8000/user/quiz/result", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quiz_id: quizId, score: sc }),
      });

    } catch (e) {
      alert(`Eroare la trimitere: ${e.message}`);
    }
  };

  if (stage === "loading")
    return <p className="pt-24 text-center text-mulberry">Se încarcă…</p>;
  if (error)
    return (
      <p className="pt-24 text-center text-red-600 whitespace-pre-wrap">
        {error}
      </p>
    );
  if (!quiz) return null;

  const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const pct       = score != null ? Math.round((score / maxPoints) * 100) : 0;

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
            className="bg-gradient-to-r from-mulberry to-pink-500 text-white px-6 py-2 rounded-md hover:opacity-90"
          >
            Trimite răspunsurile
          </button>
        ) : (
          <>
            <div className="bg-white p-4 rounded-md shadow text-center space-y-2">
              <p className="text-lg font-semibold text-mulberry">
                Ai obținut {score} / {maxPoints} puncte
              </p>
              <p className="text-sm text-gray-600">
                ({pct}%)
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-purple-200 text-mulberry px-6 py-2 rounded-md hover:bg-purple-300"
            >
              ⬅ Înapoi
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;
