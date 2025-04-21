import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const QuizzCreation = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", choices: ["", "", "", ""], answer: 0, image: null },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", choices: ["", "", "", ""], answer: 0 },
    ]);
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

  const handleImageChange = (index, file) => {
    const newQuestions = [...questions];
    newQuestions[index].image = file;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const payload = {
      title,
      class_id: classId,
      questions,
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
      navigate(`/class/${classId}`);
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
      <h1 className="text-2xl font-bold text-mulberry mb-6">
        Creează un quiz pentru clasă
      </h1>

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
                <Draggable draggableId={`q-${qIdx}`} index={qIdx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white p-4 mb-4 rounded-lg shadow-md border border-mulberry"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-gray-400 mr-2"
                        >
                          ☰
                        </div>
                        <h2 className="font-semibold text-mulberry">
                          Întrebarea {qIdx + 1}
                        </h2>
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

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(qIdx, e.target.files[0])
                        }
                      />
                      {q.image && (
                        <img
                          src={URL.createObjectURL(q.image)}
                          alt={`Întrebarea ${qIdx + 1}`}
                          className="mt-2 max-h-48 object-contain"
                        />
                      )}

                      {q.choices.map((choice, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input
                            type="radio"
                            name={`answer-${qIdx}`}
                            checked={q.answer === cIdx}
                            onChange={() =>
                              handleQuestionChange(qIdx, "answer", cIdx)
                            }
                          />
                          <input
                            className="flex-1 p-2 border border-gray-300 rounded"
                            placeholder={`Răspuns ${cIdx + 1}`}
                            value={choice}
                            onChange={(e) =>
                              handleChoiceChange(qIdx, cIdx, e.target.value)
                            }
                          />
                        </div>
                      ))}
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

export default QuizzCreation;
