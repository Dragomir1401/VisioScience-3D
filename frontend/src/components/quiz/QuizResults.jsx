import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QuizResults = () => {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
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
              userId:   r.UserID   || r.user_id,
              score:    r.Score    ?? r.score,
            }))
          : [];
        setResults(normResults);

        const pointsSum = Array.isArray(mData.questions)
          ? mData.questions.reduce((sum, q) => sum + (q.points || 1), 0)
          : 0;
        setTotalPoints(pointsSum);
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
    const score = r ? r.score : null;
    const pct = score != null && totalPoints > 0
      ? Math.round((score / totalPoints) * 100)
      : 0;
    return { ...stu, score, pct };
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
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-600 mb-4">
              <div>Email elev</div>
              <div className="text-center">Punctaj</div>
              <div className="text-right">Procentaj</div>
            </div>
            <ul className="space-y-4">
              {merged.map((u) => (
                <li key={u.id} className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-gray-800">{u.email}</span>
                  <span className="text-center text-gray-900">
                    {u.score != null ? `${u.score} / ${totalPoints}` : "Necompletat"}
                  </span>
                  <div className="flex items-center space-x-2 justify-end">
                    {u.score != null ? (
                      <>
                        <span className="text-gray-900">{u.pct}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-purple-600"
                            style={{ width: `${u.pct}%` }}
                          />
                        </div>
                      </>
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
