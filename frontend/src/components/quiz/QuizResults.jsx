import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QuizResults = () => {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, rRes, mRes] = await Promise.all([
          fetch(`http://localhost:8000/user/classes/${classId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8000/evaluation/quiz/${quizId}/results`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8000/evaluation/quiz/meta/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!sRes.ok) throw new Error("Elevi: " + await sRes.text());
        if (!rRes.ok) throw new Error("Rezultate: " + await rRes.text());
        if (!mRes.ok) throw new Error("Meta: " + await mRes.text());

        const [sData, rData, mData] = await Promise.all([
          sRes.json(),
          rRes.json(),
          mRes.json(),
        ]);

        setStudents(Array.isArray(sData) ? sData : []);
        const normResults = Array.isArray(rData)
          ? rData.map((r) => ({
              userId: r.UserID || r.user_id,
              score: r.Score ?? r.score,
              points: r.Points ?? r.points,
              timeTaken: r.TimeTaken ?? r.time_taken,
              perfectScore: r.PerfectScore ?? r.perfect_score,
              streakBonus: r.StreakBonus ?? r.streak_bonus,
              timeBonus: r.TimeBonus ?? r.time_bonus,
              timestamp: r.Timestamp ?? r.timestamp
            }))
          : [];
        setResults(normResults);

        // Calculate max points from questions
        const maxPoints = Array.isArray(mData.questions) 
          ? mData.questions.reduce((sum, q) => sum + (q.points || 1), 0)
          : 0;

        setQuizMeta({
          ...mData,
          max_points: maxPoints
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [classId, quizId, token]);

  const merged = students.map((stu) => {
    const r = results.find((x) => x.userId === stu.id);
    if (!r) return { ...stu, score: null, points: null, pct: null };
    
    const score = r.score;
    const points = r.points;
    const pct = score != null && quizMeta?.max_points > 0
      ? Math.round((score / quizMeta.max_points) * 100)
      : 0;
      
    return { 
      ...stu, 
      score, 
      points,
      pct,
      timeTaken: r.timeTaken,
      perfectScore: r.perfectScore,
      streakBonus: r.streakBonus,
      timeBonus: r.timeBonus,
      timestamp: r.timestamp
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(`/classes/${classId}`)}
          className="text-sm px-4 py-2 bg-gradient-to-r from-mulberry to-pink-500 text-white rounded shadow hover:opacity-90"
        >
          ⬅ Înapoi
        </button>
        <h1 className="text-2xl font-bold text-mulberry">Rezultate Quiz</h1>
        {loading ? (
          <p className="text-gray-500">Se încarcă…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow border border-purple-200">
            <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-600 mb-4">
              <div>Email elev</div>
              <div className="text-center">Scor</div>
              <div className="text-center">Puncte</div>
              <div className="text-right">Procentaj</div>
            </div>
            <ul className="space-y-4">
              {merged.map((u) => (
                <li key={u.id} className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-gray-800">{u.email}</span>
                  <div className="text-center">
                    {u.score != null ? (
                      <div className="space-y-1">
                        <span className="text-gray-900">
                          {u.score} / {quizMeta?.max_points || 0}
                        </span>
                        {u.points > u.score && (
                          <div className="text-xs text-green-600 space-y-0.5">
                            {u.perfectScore && <div>✨ Perfect</div>}
                            {u.streakBonus > 0 && <div>🔥 +{u.streakBonus}</div>}
                            {u.timeBonus > 0 && <div>⚡ +{u.timeBonus}</div>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Necompletat</span>
                    )}
                  </div>
                  <div className="text-center text-gray-900">
                    {u.points != null ? u.points : "—"}
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    {u.score != null ? (
                      <span
                        className={`text-lg font-bold ${
                          u.pct >= 90
                            ? "text-green-600"
                            : u.pct >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {u.pct}%
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
