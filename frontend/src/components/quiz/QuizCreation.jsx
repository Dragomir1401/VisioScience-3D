import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const QuizCreation = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", choices: ["", "", "", ""], answer: [], image: null, points: 1 },
  ]);
  const [quizConfig, setQuizConfig] = useState({
    maxPoints: 100,
    timeBonus: 10,
    perfectBonus: 20,
    streakBonus: 15,
    difficulty: "medium",
    category: "general"
  });

  const handleAddQuestion = () => {
    const newQuestion = {
      id: crypto.randomUUID(),
      text: '',
      choices: ['', '', '', ''],
      answer: [],
      points: 10,
      images: null
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (qIdx, cIdx, value) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].choices[cIdx] = value;
    setQuestions(newQuestions);
  };

  const handleAnswerToggle = (qIdx, cIdx) => {
    const newQuestions = [...questions];
    const currentAnswers = newQuestions[qIdx].answer;
    if (currentAnswers.includes(cIdx)) {
      newQuestions[qIdx].answer = currentAnswers.filter((i) => i !== cIdx);
    } else {
      newQuestions[qIdx].answer = [...currentAnswers, cIdx];
    }
    setQuestions(newQuestions);
  };

  const handleImageChange = (index, file) => {
    const newQuestions = [...questions];
    newQuestions[index].image = file;
    setQuestions(newQuestions);
  };

  const handleConfigChange = (field, value) => {
    setQuizConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Titlul quizului nu poate fi gol.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Întrebarea ${i + 1} nu are text completat.`);
        return;
      }
      if (q.choices.some((c) => !c.trim())) {
        alert(`Întrebarea ${i + 1} conține răspunsuri goale.`);
        return;
      }
      if (q.answer.length === 0) {
        alert(`Întrebarea ${i + 1} nu are niciun răspuns corect marcat.`);
        return;
      }
    }

    const token = localStorage.getItem("token");
    const owner_id = localStorage.getItem("userId");

    if (!owner_id) {
      alert("Nu s-a putut obține ID-ul utilizatorului.");
      return;
    }

    const payload = {
      title,
      class_id: classId,
      owner_id,
      questions,
      ...quizConfig
    };

    try {
      const res = await fetch("http://localhost:8000/evaluation/quiz", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      alert("Quiz creat cu succes!");
      navigate(`/classes/${classId}`);
    } catch (err) {
      alert("Eroare la creare quiz: " + err.message);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newQuestions = Array.from(questions);
    const [moved] = newQuestions.splice(result.source.index, 1);
    newQuestions.splice(result.destination.index, 0, moved);
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen pt-28 px-6 pb-12 bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed]">
      <button
        onClick={() => navigate(`/classes/${classId}`)}
        className="mb-6 text-sm px-4 py-2 bg-gradient-to-r from-mulberry to-pink-500 text-white rounded-md shadow hover:opacity-90 transition"
      >
        ⬅ Înapoi la detalii clasă
      </button>
      <h1 className="text-2xl font-bold text-mulberry mb-6">
        Creează un quiz pentru clasă
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-mulberry mb-6">
        <h2 className="text-lg font-semibold text-mulberry mb-4">Configurare Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puncte maxim
            </label>
            <input
              type="number"
              min="1"
              value={quizConfig.maxPoints}
              onChange={(e) => handleConfigChange("maxPoints", parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus timp
            </label>
            <input
              type="number"
              min="0"
              value={quizConfig.timeBonus}
              onChange={(e) => handleConfigChange("timeBonus", parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus scor perfect
            </label>
            <input
              type="number"
              min="0"
              value={quizConfig.perfectBonus}
              onChange={(e) => handleConfigChange("perfectBonus", parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus streak
            </label>
            <input
              type="number"
              min="0"
              value={quizConfig.streakBonus}
              onChange={(e) => handleConfigChange("streakBonus", parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificultate
            </label>
            <select
              value={quizConfig.difficulty}
              onChange={(e) => handleConfigChange("difficulty", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="easy">Ușor</option>
              <option value="medium">Mediu</option>
              <option value="hard">Greu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorie
            </label>
            <input
              type="text"
              value={quizConfig.category}
              onChange={(e) => handleConfigChange("category", e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="ex: Algoritmi, Structuri de date, etc."
            />
          </div>
        </div>
      </div>

      <input
        className="block w-full p-3 mb-6 border rounded-md border-mulberry"
        placeholder="Titlu quiz"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((q, qIdx) => (
                <Draggable key={qIdx} draggableId={`q-${qIdx}`} index={qIdx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white p-4 mb-4 rounded-lg shadow-md border border-mulberry"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab text-gray-400 text-lg"
                          >
                            ☰
                          </div>
                          <h2 className="font-semibold text-mulberry">
                            Întrebarea {qIdx + 1}
                          </h2>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Șterge
                        </button>
                      </div>

                      <input
                        className="block w-full mb-3 p-2 border border-gray-300 rounded"
                        placeholder="Text întrebare"
                        value={q.text}
                        onChange={(e) =>
                          handleQuestionChange(qIdx, "text", e.target.value)
                        }
                      />

                      <div className="mt-3 mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Imagine întrebare
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(qIdx, e.target.files[0])
                          }
                          className="block w-full text-sm text-mulberry file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-mulberry file:text-white hover:file:bg-purple-600"
                        />
                        {q.image && (
                          <img
                            src={URL.createObjectURL(q.image)}
                            alt={`Întrebarea ${qIdx + 1}`}
                            className="mt-2 max-h-48 object-contain rounded border border-gray-300"
                          />
                        )}
                      </div>

                      {q.choices.map((choice, cIdx) => {
                        const isCorrect = q.answer.includes(cIdx);
                        return (
                          <div
                            key={cIdx}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="checkbox"
                              checked={isCorrect}
                              onChange={() => handleAnswerToggle(qIdx, cIdx)}
                            />
                            <input
                              className={`flex-1 p-2 border rounded ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-300"
                              }`}
                              placeholder={`Răspuns ${cIdx + 1}`}
                              value={choice}
                              onChange={(e) =>
                                handleChoiceChange(qIdx, cIdx, e.target.value)
                              }
                            />
                            {isCorrect && (
                              <span className="text-green-600 text-xs font-medium">
                                ✔ Corect
                              </span>
                            )}
                            {q.choices.length > 2 && (
                              <button
                                className="text-red-500 text-sm ml-1"
                                onClick={() => {
                                  const newQuestions = [...questions];
                                  newQuestions[qIdx].choices.splice(cIdx, 1);
                                  newQuestions[qIdx].answer = newQuestions[
                                    qIdx
                                  ].answer
                                    .filter((i) => i !== cIdx)
                                    .map((i) => (i > cIdx ? i - 1 : i));
                                  setQuestions(newQuestions);
                                }}
                                title="Șterge răspuns"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* ➕ Buton adăugare răspuns */}
                      <button
                        onClick={() => {
                          const newQuestions = [...questions];
                          newQuestions[qIdx].choices.push("");
                          setQuestions(newQuestions);
                        }}
                        className="text-sm text-purple-700 hover:underline mt-1"
                      >
                        ➕ Adaugă răspuns
                      </button>

                      <div className="mt-2">
                        <label className="text-sm text-gray-700 font-medium">
                          Punctaj întrebare:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={q.points || 1}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIdx,
                              "points",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="ml-2 w-16 p-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={handleAddQuestion}
        className="block mt-4 text-sm text-purple-700 hover:underline"
      >
        ➕ Adaugă întrebare
      </button>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-gradient-to-r from-pink-500 to-mulberry text-white px-6 py-2 rounded-md hover:opacity-90"
      >
        Trimite quiz
      </button>
    </div>
  );
};

export default QuizCreation;
