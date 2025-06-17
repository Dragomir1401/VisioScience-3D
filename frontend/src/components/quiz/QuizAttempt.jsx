import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BadgeNotification from "../common/BadgeNotification";
import { jwtDecode } from "jwt-decode";

const dbg = (...a) => console.debug("[QuizAttempt]", ...a);

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [stage, setStage] = useState("loading");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const startTime = useRef(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);

  useEffect(() => {
    setTimeStarted(Date.now());
    (async () => {
      try {
        dbg("GET quiz for attempt", quizId);
        const r = await fetch(
          `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error(`${r.status} – ${await r.text()}`);
        const raw = await r.json();

        console.log("Raw quiz attempt data:", raw);

        const questions = (raw.questions || []).map((q, index) => ({
          id: q.id === "000000000000000000000000" ? `${raw.id}-${index}` : q.id,
          text: q.text,
          choices: q.choices || [],
          images: q.images || [],
          points: q.points || 1,
        }));

        setQuiz({
          title: raw.title,
          questions,
          maxPoints: raw.maxPoints,
          timeBonus: raw.timeBonus,
          perfectBonus: raw.perfectBonus,
          streakBonus: raw.streakBonus,
          classId: raw.class_id,
        });
        console.log("Quiz state after setting:", quiz);
        console.log("Processed questions for quiz:", questions);

        setAnswers(Array(questions.length).fill(null));
        setStage("ready");
      } catch (e) {
        dbg("Fetch error:", e);
        setError(e.message);
      }
    })();
  }, [quizId, token]);

  const choose = (qIdx, cIdx) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[qIdx] = cIdx;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const startTime = Date.now();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const claims = jwtDecode(token);

      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      setTimeTaken(timeSpent);

      const evaluationPayload = {
        quiz_id: quizId,
        answers: answers.map((a) => parseInt(a, 10)),
        timeTaken: timeSpent,
        maxScore: quiz.questions.length,
        class_id: quiz.classId,
      };

      console.log("Evaluation Payload:", evaluationPayload);

      const evaluationResponse = await fetch(
        `http://localhost:8000/evaluation/quiz/attempt/${quizId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(evaluationPayload),
        }
      );

      if (!evaluationResponse.ok) {
        throw new Error("Failed to submit quiz to evaluation service");
      }

      const evaluationData = await evaluationResponse.json();
      setResult(evaluationData);

      const incorrectlyAnsweredQuestions = quiz.questions
        .filter((_, index) => !evaluationData.correctAnswers[index])
        .map((q) => q.id);

      const userDataPayload = {
        quiz_id: quizId,
        class_id: quiz.classId,
        quiz_title: quiz.title,
        score: evaluationData.score,
        max_score: evaluationData.maxScore,
        time_taken: timeSpent,
        perfect_score: evaluationData.score === evaluationData.maxScore,
        questions_total: quiz.questions.length,
        questions_correct: evaluationData.score,
        questions_incorrect: quiz.questions.length - evaluationData.score,
        difficulty_level: quiz.difficulty || "medium",
        completion_time: timeSpent,
        streak_bonus: evaluationData.streakBonus,
        time_bonus: evaluationData.timeBonus,
        perfect_bonus: evaluationData.perfectBonus,
        total_points: evaluationData.points,
        quiz_type: quiz.type || "standard",
        attempt_number: 1,
        completion_date: new Date().toISOString(),
        incorrectly_answered_questions: incorrectlyAnsweredQuestions,
        performance_metrics: {
          accuracy: (evaluationData.score / evaluationData.maxScore) * 100,
          speed: evaluationData.timeBonus > 0 ? 100 : 50,
          consistency: evaluationData.streakBonus > 0 ? "high" : "normal",
        },
      };

      console.log("User Data Payload:", userDataPayload);

      const userDataResponse = await fetch(
        `http://localhost:8000/user/quiz/result`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDataPayload),
        }
      );

      if (!userDataResponse.ok) {
        console.error(
          "Failed to save detailed quiz statistics:",
          await userDataResponse.text()
        );
        // Don't throw here, as the quiz was already evaluated successfully
      }

      // Update badge progress using the new endpoint
      try {
        const badgeProgressResponse = await fetch(
          `http://localhost:8000/user/badges/quiz-progress`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quiz_result: userDataPayload,
            }),
          }
        );

        if (!badgeProgressResponse.ok) {
          console.warn(
            "Failed to update badge progress:",
            await badgeProgressResponse.text()
          );
        }
      } catch (badgeProgressError) {
        console.warn("Error updating badge progress:", badgeProgressError);
      }

      // Check for new badges after quiz completion
      try {
        const badgesResponse = await fetch(
          `http://localhost:8000/user/badges/${claims.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (badgesResponse.ok) {
          const badges = await badgesResponse.json();
          const newlyEarnedBadges = badges.filter(
            (badge) =>
              badge.completed &&
              (!badge.earnedAt ||
                new Date(badge.earnedAt) > new Date(Date.now() - 5000))
          );

          if (newlyEarnedBadges.length > 0) {
            setNewBadges(newlyEarnedBadges);
            setShowBadgeNotification(true);
          }
        } else {
          console.warn(
            "Failed to fetch badges:",
            badgesResponse.status,
            await badgesResponse.text()
          );
        }
      } catch (badgeError) {
        console.warn("Error checking badges:", badgeError);
      }

      console.log("Quiz results saved:", {
        score: evaluationData.score,
        maxScore: evaluationData.maxScore,
        correctAnswers: evaluationData.correctAnswers,
        points: evaluationData.points,
        bonuses: {
          time: evaluationData.timeBonus,
          perfect: evaluationData.perfectBonus,
          streak: evaluationData.streakBonus,
        },
        incorrectlyAnsweredQuestions,
      });

      setStage("sent");
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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

  if (result) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Rezultate quiz-uri</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Scor</h3>
              <p className="text-3xl font-bold text-blue-600">
                {result.score} / {result.maxScore}
              </p>
              <p className="text-sm text-gray-500">
                {((result.score / result.maxScore) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Total Puncte</h3>
              <p className="text-3xl font-bold text-green-600">
                {result.points}
              </p>
            </div>
          </div>

          {result.timeBonus > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-700">
                Bonus timp: +{result.timeBonus} puncte
              </p>
            </div>
          )}

          {result.perfectBonus > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                Bonus scor perfect: +{result.perfectBonus} puncte
              </p>
            </div>
          )}

          {result.streakBonus > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-purple-700">
                Bonus streak: +{result.streakBonus} puncte
              </p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Rezultate întrebări</h3>
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-4 mb-3 rounded-lg ${
                  result.correctAnswers[idx] ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p className="font-medium">{q.text}</p>
                <p className="text-sm mt-1">
                  {result.correctAnswers[idx] ? "✓ Corect" : "✗ Incorect"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-mulberry text-white rounded-lg hover:bg-mulberry-dark transition-colors duration-200 font-medium shadow-sm"
            >
              Înapoi la Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-gray-500 mt-2">Puncte: {q.points}</p>
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
            <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200 space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-mulberry">
                  Ai obținut {result.score} / {quiz.maxPoints} puncte
                </p>
                <p className="text-sm text-gray-600">
                  {((result.score / quiz.maxPoints) * 100).toFixed(1)}%
                </p>
              </div>

              {result.points > result.score && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Bonusuri obținute:
                  </h3>
                  <ul className="space-y-2">
                    {result.perfectBonus > 0 && (
                      <li className="flex items-center gap-2 text-green-700">
                        <span>✨</span> Bonus scor perfect: +{quiz.perfectBonus}{" "}
                        puncte
                      </li>
                    )}
                    {result.streakBonus > 0 && (
                      <li className="flex items-center gap-2 text-green-700">
                        <span>🔥</span> Bonus streak: +{result.streakBonus}{" "}
                        puncte
                      </li>
                    )}
                    {result.timeBonus > 0 && (
                      <li className="flex items-center gap-2 text-green-700">
                        <span>⚡</span> Bonus timp: +{result.timeBonus} puncte
                      </li>
                    )}
                  </ul>
                  <p className="mt-2 font-semibold text-green-800">
                    Total puncte cu bonusuri: {result.points}
                  </p>
                </div>
              )}
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

      {showBadgeNotification && (
        <BadgeNotification
          badges={newBadges}
          onClose={() => setShowBadgeNotification(false)}
        />
      )}
    </div>
  );
};

export default QuizAttempt;
