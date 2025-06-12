import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, month, week
  const [globalStats, setGlobalStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    averageScore: 0,
    perfectScores: 0,
    topPerformers: []
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch class statistics
      const classRes = await fetch("http://localhost:8000/user/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!classRes.ok) throw new Error("Failed to fetch classes");
      const classesData = await classRes.json();

      // Calculate total students
      const totalStudents = classesData.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

      // Fetch quiz statistics
      const quizRes = await fetch("http://localhost:8000/evaluation/quizzes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!quizRes.ok) throw new Error("Failed to fetch quizzes");
      const quizzesData = await quizRes.json();

      // Calculate statistics
      const totalQuizzes = quizzesData.length;
      const perfectScores = quizzesData.reduce((sum, quiz) => sum + (quiz.perfect_scores || 0), 0);
      const averageScore = quizzesData.length > 0
        ? Math.round(quizzesData.reduce((sum, quiz) => sum + (quiz.average_score || 0), 0) / quizzesData.length)
        : 0;

      // Fetch top performers
      const performersRes = await fetch("http://localhost:8000/user/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!performersRes.ok) throw new Error("Failed to fetch leaderboard");
      const performersData = await performersRes.json();

      setGlobalStats({
        totalQuizzes,
        totalStudents,
        averageScore,
        perfectScores,
        topPerformers: performersData.slice(0, 6) // Get top 6 performers
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-sm px-4 py-2 bg-gradient-to-r from-mulberry to-pink-500 text-white rounded shadow hover:opacity-90"
            >
              ⬅ Înapoi la Dashboard
            </button>
            <h1 className="text-3xl font-bold text-mulberry mt-4">
              Rapoarte și Metrici
            </h1>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-purple-200 bg-white shadow-sm"
          >
            <option value="all">Toate datele</option>
            <option value="month">Ultima lună</option>
            <option value="week">Ultima săptămână</option>
          </select>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {/* Global Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
                <h3 className="text-lg font-semibold text-mulberry mb-2">Total Quiz-uri</h3>
                <p className="text-3xl font-bold text-gray-900">{globalStats.totalQuizzes}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
                <h3 className="text-lg font-semibold text-mulberry mb-2">Total Elevi</h3>
                <p className="text-3xl font-bold text-gray-900">{globalStats.totalStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
                <h3 className="text-lg font-semibold text-mulberry mb-2">Scor Mediu</h3>
                <p className="text-3xl font-bold text-gray-900">{globalStats.averageScore}%</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
                <h3 className="text-lg font-semibold text-mulberry mb-2">Scoruri Perfecte</h3>
                <p className="text-3xl font-bold text-gray-900">{globalStats.perfectScores}</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
              <h3 className="text-lg font-semibold text-mulberry mb-4">Top Performeri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalStats.topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : "bg-amber-600 text-amber-900"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">
                          {student.totalPoints} puncte
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics; 