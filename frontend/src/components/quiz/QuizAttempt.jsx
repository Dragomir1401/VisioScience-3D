import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

        console.log('Raw quiz attempt data:', raw);

        const questions = (raw.questions || []).map((q, index) => ({
          id: q.id === '000000000000000000000000' ? `${raw.id}-${index}` : q.id,
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
          classId: raw.class_id
        });
        console.log('Quiz state after setting:', quiz);
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
      const timeTaken = Math.floor((Date.now() - timeStarted) / 1000); // in seconds
      const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      
      console.log('=== QUIZ ATTEMPT START ===');
      console.log('Quiz Details:', {
        id: quizId,
        title: quiz.title,
        classId: quiz.classId,
        difficulty: quiz.difficulty,
        questionsCount: quiz.questions.length,
        maxScore,
        timeStarted: new Date(timeStarted).toISOString(),
        timeTaken
      });
      
      // 1. Trimite răspunsurile către evaluation-service
      console.log('\n=== SENDING TO EVALUATION SERVICE ===');
      const evaluationPayload = { 
        answers,
        timeTaken,
        maxScore
      };
      console.log('Evaluation Payload:', evaluationPayload);

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
      if (!evaluationResponse.ok) throw new Error(`${evaluationResponse.status} – ${await evaluationResponse.text()}`);

      const evaluationResult = await evaluationResponse.json();
      console.log('Evaluation Response:', evaluationResult);
      setResult(evaluationResult);
      setStage("sent");

      // 2. Trimite rezultatele către user-data-service pentru stocare și statistici
      console.log('\n=== SENDING TO USER DATA SERVICE ===');
      const userDataPayload = { 
        quiz_id: quizId,
        score: evaluationResult.score,
        max_score: maxScore,
        time_taken: timeTaken,
        perfect_score: evaluationResult.score === maxScore,
        questions_total: quiz.questions.length,
        questions_correct: evaluationResult.score,
        questions_incorrect: quiz.questions.length - evaluationResult.score,
        difficulty_level: quiz.difficulty || 'medium',
        completion_time: timeTaken,
        streak_bonus: evaluationResult.streakBonus || 0,
        time_bonus: evaluationResult.timeBonus || 0,
        perfect_bonus: evaluationResult.perfectScore ? (quiz.perfectBonus || 0) : 0,
        total_points: evaluationResult.points || evaluationResult.score,
        class_id: quiz.classId,
        quiz_title: quiz.title,
        quiz_type: quiz.type || 'standard',
        attempt_number: 1,
        completion_date: new Date().toISOString(),
        performance_metrics: {
          accuracy: (evaluationResult.score / maxScore) * 100,
          speed: maxScore / timeTaken,
          consistency: evaluationResult.streakBonus > 0 ? 'high' : 'medium'
        }
      };
      console.log('User Data Payload:', userDataPayload);

      const userDataResponse = await fetch("http://localhost:8000/user/quiz/result", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDataPayload),
      });

      if (!userDataResponse.ok) {
        const errorText = await userDataResponse.text();
        console.error('User Data Service Error:', {
          status: userDataResponse.status,
          statusText: userDataResponse.statusText,
          error: errorText
        });
      } else {
        const userDataResult = await userDataResponse.json();
        console.log('User Data Service Response:', userDataResult);
      }

      // 3. Actualizează statisticile quiz-ului
      console.log('\n=== UPDATING QUIZ STATISTICS ===');
      const quizStatsPayload = {
        quiz_id: quizId,
        score: evaluationResult.score,
        time_taken: timeTaken,
        points: evaluationResult.points || evaluationResult.score,
        total_attempts: 1,
        average_score: evaluationResult.score,
        average_points: evaluationResult.points || evaluationResult.score,
        perfect_scores: evaluationResult.score === maxScore ? 1 : 0,
        average_time: timeTaken,
        top_performers: [],
        question_stats: [],
      };
      console.log('Quiz Stats Payload:', quizStatsPayload);

      const quizStatsResponse = await fetch(
        `http://localhost:8000/evaluation/quiz/${quizId}/statistics`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quizStatsPayload),
        }
      );

      if (!quizStatsResponse.ok) {
        const errorText = await quizStatsResponse.text();
        console.error('Quiz Stats Service Error:', {
          status: quizStatsResponse.status,
          statusText: quizStatsResponse.statusText,
          error: errorText
        });
      } else {
        const quizStatsResult = await quizStatsResponse.json();
        console.log('Quiz Stats Service Response:', quizStatsResult);
      }

      console.log('\n=== QUIZ ATTEMPT COMPLETED ===');

    } catch (e) {
      console.error('Quiz Attempt Error:', e);
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
  const pct = result ? Math.round((result.score / maxPoints) * 100) : 0;

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
                  Ai obținut {result.score} / {maxPoints} puncte
                </p>
                <p className="text-sm text-gray-600">({pct}%)</p>
              </div>

              {result.points > result.score && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Bonusuri obținute:</h3>
                  <ul className="space-y-2">
                    {result.perfectScore && (
                      <li className="flex items-center gap-2 text-green-700">
                        <span>✨</span> Bonus scor perfect: +{quiz.perfectBonus} puncte
                      </li>
                    )}
                    {result.streakBonus > 0 && (
                      <li className="flex items-center gap-2 text-green-700">
                        <span>🔥</span> Bonus streak: +{result.streakBonus} puncte
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
    </div>
  );
};

export default QuizAttempt;
