import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const normalizeQuiz = (raw) => ({
    id: raw.ID,
    title: raw.Title,
    classId: raw.ClassID,
    ownerId: raw.OwnerID,
    createdAt: raw.CreatedAt,
    questions: raw.Questions.map((q) => ({
      id: q.ID,
      text: q.Text,
      choices: q.Choices,
      answer: q.Answer,
      images: q.Images,
      points: q.Points,
    })),
  });

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
        setQuiz(normalizeQuiz(data));
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
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md border border-mulberry">
        <h1 className="text-2xl font-bold text-mulberry mb-6">{quiz.title}</h1>

        {quiz.questions.map((q, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="font-semibold mb-2">
              {idx + 1}. {q.text}
            </h2>
            {q.images && q.images.length > 0 && (
              <div className="mb-2">
                {q.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`img-${i}`}
                    className="max-h-48 mb-2"
                  />
                ))}
              </div>
            )}
            <ul className="list-inside">
              {q.choices.map((choice, cIdx) => (
                <li
                  key={cIdx}
                  className={`p-2 border rounded mb-1 ${
                    q.answer.includes(cIdx)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  {choice}
                  {q.answer.includes(cIdx) && (
                    <span className="ml-2 text-green-600 font-medium text-xs">
                      ✔ corect
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-1 text-gray-600">
              Punctaj întrebare: {q.points}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDetails;
