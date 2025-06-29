import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ClassActions from "./ClassActions";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorStudents, setErrorStudents] = useState("");
  const [errorQuizzes, setErrorQuizzes] = useState("");
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [studentStats, setStudentStats] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchClassQuizzes();
  }, [id]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(
        `http://localhost:8000/user/classes/${id}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      
      // Fetch student statistics
      const stats = {};
      for (const student of data) {
        try {
          const statsRes = await fetch(
            `http://localhost:8000/user/${student.id}/stats`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (statsRes.ok) {
            const studentData = await statsRes.json();
            stats[student.id] = studentData;
          }
        } catch (error) {
          console.log("Could not fetch stats for student:", student.id);
        }
      }
      setStudentStats(stats);
    } catch {
      setErrorStudents("Eroare la încărcarea elevilor.");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch(
        `http://localhost:8000/evaluation/quiz/class/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setErrorQuizzes("Eroare la încărcarea quiz-urilor.");
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi această clasă?")) return;
    try {
      const res = await fetch(`http://localhost:8000/user/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      navigate("/profile");
    } catch {
      alert("Eroare la ștergerea clasei.");
    }
  };

  const toggleQuizStatus = async (quizId, currentStatus, e) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:8000/evaluation/quiz/${quizId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_open: !currentStatus }),
      });
      fetchClassQuizzes();
    } catch {
      console.error("Eroare la actualizarea statusului quiz-ului");
    }
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm("Ești sigur că vrei să ștergi acest quiz?")) return;
    try {
      const res = await fetch(`http://localhost:8000/evaluation/quiz/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      fetchClassQuizzes();
    } catch {
      alert("Eroare la ștergerea quiz-ului.");
    }
  };

  const getStudentPerformance = (stats) => {
    if (!stats || !stats.quizResults || stats.quizResults.length === 0) {
      return { level: "Fără activitate", color: "text-gray-500", bg: "bg-gray-100" };
    }
    
    const avgScore = stats.quizResults.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore), 0) / stats.quizResults.length;
    const percentage = avgScore * 100;
    
    if (percentage >= 90) return { level: "Excelent", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 80) return { level: "Bun", color: "text-blue-600", bg: "bg-blue-100" };
    if (percentage >= 70) return { level: "Satisfăcător", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "În curs de îmbunătățire", color: "text-red-600", bg: "bg-red-100" };
  };

  const studentList = Array.isArray(students) ? students : [];
  const quizList = Array.isArray(quizzes) ? quizzes : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/profile")}
          className="inline-block text-sm px-4 py-2 bg-gradient-to-r from-mulberry to-pink-500 text-white rounded-lg shadow hover:opacity-90 transition"
        >
          ⬅ Înapoi la profil
        </button>

        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-md border border-mulberry">
          <div>
            <h2 className="text-2xl font-bold text-mulberry">Detalii clasă</h2>
            <p className="text-gray-600 text-sm mt-1">
              ID clasă: <code className="font-mono">{id}</code>
            </p>
          </div>
          <button
            onClick={() => navigate(`/classes/${id}/quiz/create`)}
            className="inline-block bg-mulberry text-white px-4 py-2 rounded-lg hover:bg-purple transition text-sm"
          >
            Creează quiz
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/classes/${id}/quiz/create`)}
            className="inline-block bg-mulberry text-white px-4 py-2 rounded-lg hover:bg-purple transition text-sm"
          >
            Creează quiz
          </button>
          <button
            onClick={handleDelete}
            className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Șterge clasa
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <ClassActions classId={id} onSuccess={fetchStudents} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">
            Elevi înscriși ({studentList.length})
          </h3>
          {loadingStudents ? (
            <p className="text-gray-500">Se încarcă elevii…</p>
          ) : errorStudents ? (
            <p className="text-red-600">{errorStudents}</p>
          ) : studentList.length === 0 ? (
            <p className="italic text-gray-500">Niciun elev înscris.</p>
          ) : (
            <ul className="space-y-2">
              {studentList.map((s) => {
                const stats = studentStats[s.id] || {};
                const performance = getStudentPerformance(stats);
                return (
                  <li key={s.id} className="relative">
                    <div
                      onMouseEnter={() => setHoveredStudent(s.id)}
                      onMouseLeave={() => setHoveredStudent(null)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-700">
                              {s.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{s.email}</div>
                            <div className="text-sm text-gray-500">ID: {s.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${performance.color} ${performance.bg}`}>
                            {performance.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredStudent === s.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 left-0 top-full mt-2 w-[440px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-6"
                        >
                          {/* Arrow */}
                          <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                          {/* DASHBOARD-LIKE STATS PREVIEW */}
                          <div className="space-y-6">
                            {/* Header: Email, ID */}
                            <div className="mb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-mulberry text-base">{s.email}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">ID: {s.id}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                <span>Quiz-uri: <b>{stats.total_quizzes ?? 0}</b></span>
                                <span>Scor mediu: <b>{stats.average_score ? stats.average_score.toFixed(1) : "0.0"}%</b></span>
                                <span>Perfecte: <b>{stats.perfect_scores ?? 0}</b></span>
                                <span>Puncte: <b>{stats.total_points ?? 0}</b></span>
                              </div>
                            </div>

                            {/* Performance & Rankings */}
                            <div className="flex flex-wrap gap-4 items-center">
                              <div className="flex flex-col items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold mb-1 ${stats.performance_level === "Excelent" ? "bg-green-100 text-green-700" : stats.performance_level === "Bun" ? "bg-blue-100 text-blue-700" : stats.performance_level === "Satisfăcător" ? "bg-yellow-100 text-yellow-700" : stats.performance_level === "În curs de îmbunătățire" ? "bg-orange-100 text-orange-700" : stats.performance_level === "Necesită atenție" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{stats.performance_level || "-"}</span>
                                <span className="text-xs text-gray-500">Nivel performanță</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold mb-1 ${stats.improvement_trend === "Îmbunătățire" ? "text-green-600" : stats.improvement_trend === "Scădere" ? "text-red-600" : stats.improvement_trend === "Stabil" ? "text-blue-600" : "text-gray-600"}`}>{stats.improvement_trend === "Îmbunătățire" ? "↗️ " : stats.improvement_trend === "Scădere" ? "↘️ " : stats.improvement_trend === "Stabil" ? "→ " : ""}{stats.improvement_trend || "-"}</span>
                                <span className="text-xs text-gray-500">Tendință</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="px-3 py-1 rounded-full text-xs font-bold mb-1 bg-indigo-100 text-indigo-700">#{stats.global_ranking ?? '-'}</span>
                                <span className="text-xs text-gray-500">Global</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="px-3 py-1 rounded-full text-xs font-bold mb-1 bg-pink-100 text-pink-700">#{stats.class_ranking ?? '-'}</span>
                                <span className="text-xs text-gray-500">Clasă</span>
                              </div>
                            </div>

                            {/* Categories & Difficulties */}
                            <div className="flex flex-wrap gap-4">
                              <div>
                                <div className="font-semibold text-xs text-gray-700 mb-1">Categorii quiz:</div>
                                <div className="flex flex-wrap gap-1">
                                  {(stats.quiz_categories || []).map((cat, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {cat.category} <b>x{cat.count}</b>
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-gray-700 mb-1">Dificultăți:</div>
                                <div className="flex flex-wrap gap-1">
                                  {(stats.difficulty_stats || []).map((diff, idx) => (
                                    <span key={idx} className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {diff.difficulty} <b>x{diff.count}</b> ({diff.average ? diff.average.toFixed(1) : "0.0"}%)
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {stats.recent_performance && stats.recent_performance.length > 0 && (
                              <div>
                                <div className="font-semibold text-xs text-gray-700 mb-1">Performanță recentă:</div>
                                <div className="flex items-end gap-1 h-16">
                                  {stats.recent_performance.slice(-9).map((perf, index) => (
                                    <div
                                      key={index}
                                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                                      style={{
                                        height: `${Math.max(perf.score * 0.4, 4)}px`,
                                        minHeight: '4px'
                                      }}
                                      title={`${perf.date}: ${perf.score.toFixed(1)}%`}
                                    />
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Ultimele {stats.recent_performance.length} quiz-uri
                                </div>
                              </div>
                            )}

                            {/* Weekly Progress Chart */}
                            {stats.weekly_progress && stats.weekly_progress.length > 0 && (
                              <div>
                                <div className="font-semibold text-xs text-gray-700 mb-1">Progres săptămânal:</div>
                                <div className="flex items-end gap-1 h-16">
                                  {stats.weekly_progress.map((week, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                      <div
                                        className="w-4 rounded-t bg-gradient-to-t from-pink-500 to-pink-300"
                                        style={{ height: `${Math.max(week.avg_score * 0.4, 4)}px`, minHeight: '4px' }}
                                        title={`Săpt. ${week.week}: ${week.avg_score ? week.avg_score.toFixed(1) : "0.0"}% (${week.quizzes} quiz-uri)`}
                                      ></div>
                                      <span className="text-[10px] text-gray-400 mt-0.5">{week.quizzes}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Scor mediu / săptămână (număr quiz-uri sub bară)</div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="border-t pt-3">
                              <h5 className="font-medium text-gray-900 mb-2">Acțiuni disponibile:</h5>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>📊</span>
                                  <span>Vezi rezultate detaliate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>📈</span>
                                  <span>Analizează progresul</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>🎯</span>
                                  <span>Verifică performanța</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">
            Quiz-uri atribuite
          </h3>
          {loadingQuizzes ? (
            <p className="text-gray-500">Se încarcă quiz-urile…</p>
          ) : errorQuizzes ? (
            <p className="text-red-600">{errorQuizzes}</p>
          ) : quizList.length === 0 ? (
            <p className="italic text-gray-500">Niciun quiz atribuit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() =>
                    navigate(`/classes/${id}/quiz/${quiz.id}/results`)
                  }
                  className="bg-white p-6 rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-xl transition"
                >
                  <h4 className="text-xl font-bold text-mulberry mb-4">
                    <Link
                      to={`/quiz/${quiz.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {quiz.title || "Quiz fără titlu"}
                    </Link>
                  </h4>

                  <div className="mt-auto flex space-x-4">
                    <button
                      onClick={(e) =>
                        toggleQuizStatus(quiz.id, quiz.is_open, e)
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md border-2
                        ${quiz.is_open
                          ? "bg-gradient-to-r from-rose-500 to-red-500 text-white border-rose-400 hover:from-rose-600 hover:to-red-600"
                          : "bg-gradient-to-r from-emerald-400 to-green-500 text-white border-emerald-400 hover:from-emerald-500 hover:to-green-600"
                        }`}
                      title={quiz.is_open ? "Închide quiz" : "Deschide quiz"}
                    >
                      {quiz.is_open ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg>
                          Închide quiz
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2zm6-6V7a6 6 0 10-12 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" /></svg>
                          Deschide quiz
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                      className="flex-1 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-600 transition flex items-center justify-center gap-2 shadow-md border-2 border-rose-400"
                      title="Șterge quiz"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
