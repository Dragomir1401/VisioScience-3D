// src/components/quiz/StudentQuizDetails.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const StudentQuizDetails = ({ classId }) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState("");
  const [hoveredQuiz, setHoveredQuiz] = useState(null);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        // Fetch user stats
        try {
          const statsRes = await fetch(
            `http://localhost:8000/user/${userId}/stats`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setUserStats(stats);
          }
        } catch (statsError) {
          console.warn("Could not fetch user stats:", statsError);
        }

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
              questionsCount: q.questions?.length || 0,
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "physics":
        return "bg-blue-100 text-blue-700";
      case "chemistry":
        return "bg-green-100 text-green-700";
      case "math":
        return "bg-purple-100 text-purple-700";
      case "astronomy":
        return "bg-indigo-100 text-indigo-700";
      case "computer_science":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPerformanceLevelColor = (level) => {
    switch (level) {
      case "Excelent":
        return "bg-green-100 text-green-700";
      case "Bun":
        return "bg-blue-100 text-blue-700";
      case "Satisfăcător":
        return "bg-yellow-100 text-yellow-700";
      case "În curs de îmbunătățire":
        return "bg-orange-100 text-orange-700";
      case "Necesită atenție":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getImprovementTrendColor = (trend) => {
    switch (trend) {
      case "Îmbunătățire":
        return "text-green-600";
      case "Scădere":
        return "text-red-600";
      case "Stabil":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (load) return <p className="text-sm text-gray-500">Se încarcă…</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (data.length === 0)
    return (
      <p className="text-sm italic text-gray-500">Nu există quiz-uri încă.</p>
    );

  return (
    <ul className="space-y-3 text-sm">
      {data.map((q) => (
        <li key={q.id} className="flex items-center justify-between relative">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                {q.is_open ? (
                  <Link
                    to={`/quiz/meta/${q.id}`}
                    className="text-mulberry font-medium hover:underline cursor-pointer"
                    onMouseEnter={() => setHoveredQuiz(q.id)}
                    onMouseLeave={() => setHoveredQuiz(null)}
                  >
                    {q.title}
                  </Link>
                ) : (
                  <span 
                    className="text-gray-400 font-medium cursor-pointer"
                    onMouseEnter={() => setHoveredQuiz(q.id)}
                    onMouseLeave={() => setHoveredQuiz(null)}
                  >
                    {q.title}
                  </span>
                )}
                
                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredQuiz === q.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute z-50 left-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                      {/* Arrow */}
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                      {/* Quiz Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-base mb-2">
                            {q.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {q.questionsCount} întrebări • {q.maxPoints} puncte maxime
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(q.category)}`}>{q.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{q.is_open ? "Disponibil" : "Închis"}</span>
                        </div>
                        {q.result ? (
                          <div className="border-t pt-3">
                            <h5 className="font-medium text-gray-900 mb-2">Rezultat la acest quiz:</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Scor:</span>
                                <span className="text-sm font-medium text-green-700">
                                  {q.result.score !== null ? `${Math.min(q.result.score, q.maxPoints)}/${q.maxPoints}` : "În evaluare"}
                                </span>
                              </div>
                              {q.result.perfectScore && (
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <span>✨</span>
                                  <span className="text-sm">Scor perfect!</span>
                                </div>
                              )}
                              {q.result.streakBonus > 0 && (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <span>🔥</span>
                                  <span className="text-sm">Bonus streak: +{q.result.streakBonus}</span>
                                </div>
                              )}
                              {q.result.timeBonus > 0 && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <span>⚡</span>
                                  <span className="text-sm">Bonus timp: +{q.result.timeBonus}</span>
                                </div>
                              )}
                              {q.result.points > q.result.score && (
                                <div className="flex justify-between pt-1 border-t">
                                  <span className="text-sm font-medium text-gray-900">Total cu bonus:</span>
                                  <span className="text-sm font-bold text-green-700">{q.result.points}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t pt-3">
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="text-sm">Status:</span>
                              <span className="text-sm font-medium">Neînceput</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                {q.difficulty}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(q.category)}`}>
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
