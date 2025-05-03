import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/evaluation/quiz/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError("Eroare la încărcarea quizului.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading)
    return <p className="text-center mt-12 text-mulberry">Se încarcă...</p>;

  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-mulberry">
            Quiz: {quiz.title}
          </h1>
          <h2 className="text-lg text-gray-600 mt-2">
            Clasă asociată:{" "}
            <code className="font-mono text-purple-700">{quiz.class_id}</code>
          </h2>
          <button
            onClick={() => navigate(`/classes/${quiz.class_id}`)}
            className="text-sm bg-gradient-to-r from-mulberry to-pink-500 text-white px-4 py-2 rounded-md hover:bg-purple"
          >
            ⬅ Înapoi la clasă
          </button>
        </div>

        {quiz.questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white p-4 rounded-xl shadow-md border border-purple-200 space-y-2"
          >
            <div className="font-semibold text-purple-800">
              {idx + 1}. {q.text}
            </div>

            {q.images && Array.isArray(q.images) && q.images.length > 0 && (
              <div className="mt-2">
                {q.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Întrebare ${idx + 1} - imagine ${i + 1}`}
                    className="max-h-48 rounded border border-gray-300 mb-2"
                  />
                ))}
              </div>
            )}

            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {q.choices.map((choice, cIdx) => (
                <li
                  key={cIdx}
                  className={
                    q.answer.includes(cIdx) ? "font-medium text-green-600" : ""
                  }
                >
                  {choice}
                  {q.answer.includes(cIdx) && " ✔"}
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-500">Puncte: {q.points || 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDetails;
