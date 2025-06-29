import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hoveredClass, setHoveredClass] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClasses(data);
    } catch {
      setError("Eroare la încărcarea claselor.");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newClassName.trim()) {
      setError("Numele clasei nu poate fi gol.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/user/classes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newClassName }),
      });

      if (!res.ok) throw new Error(await res.text());
      setNewClassName("");
      setMessage("Clasa a fost creată!");
      fetchClasses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoToClass = (cls) => {
    navigate(`/classes/${cls.id}`);
  };

  const getClassStatus = (students) => {
    const studentCount = students ? students.length : 0;
    if (studentCount === 0) return { text: "Fără elevi", color: "text-gray-500", bg: "bg-gray-100" };
    if (studentCount < 5) return { text: "Clasă mică", color: "text-blue-600", bg: "bg-blue-100" };
    if (studentCount < 15) return { text: "Clasă medie", color: "text-green-600", bg: "bg-green-100" };
    return { text: "Clasă mare", color: "text-purple-600", bg: "bg-purple-100" };
  };

  return (
    <div className="mt-10 px-4 max-w-4xl mx-auto space-y-10">
      {/* Analytics Button */}
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border border-purple-200">
        <h3 className="text-xl font-semibold text-mulberry mb-4">Rapoarte și Metrici</h3>
        <p className="text-gray-600 text-center mb-6">
          Vizualizează statistici detaliate despre performanța elevilor și rezultatele quiz-urilor
        </p>
        <button
          onClick={() => navigate("/analytics")}
          className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-3 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Vezi Rapoarte
        </button>
      </div>

      {/* Classes List */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
        <h3 className="text-lg font-semibold text-mulberry mb-4">
          Clasele tale
        </h3>
        {!classes || classes.length === 0 ? (
          <p className="text-sm text-gray-500">Nu ai creat nicio clasă încă.</p>
        ) : (
          <ul className="space-y-3">
            {classes.map((cls) => {
              const status = getClassStatus(cls.students);
              return (
                <li
                  key={cls.id}
                  className="relative"
                >
                  <div
                    onClick={() => handleGoToClass(cls)}
                    onMouseEnter={() => setHoveredClass(cls.id)}
                    onMouseLeave={() => setHoveredClass(null)}
                    className="p-4 bg-purple-50 border border-purple-200 rounded shadow-sm cursor-pointer hover:bg-purple-100 transition"
                  >
                    <div className="font-semibold text-purple-800">{cls.name}</div>
                    <div className="text-sm text-gray-600">
                      Cod înscriere: <code className="font-mono">{cls.code}</code>
                    </div>
                    <div className="text-sm text-gray-600">
                      Elevi înscriși: {cls.students ? cls.students.length : 0}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredClass === cls.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 left-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                      >
                        {/* Arrow */}
                        <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                        
                        {/* Class Details */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base mb-2">
                              {cls.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Clasă creată pentru gestionarea quiz-urilor și elevilor
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cod de înscriere:</span>
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {cls.code}
                              </code>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Număr elevi:</span>
                              <span className="text-sm font-medium text-purple-700">
                                {cls.students ? cls.students.length : 0}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Status clasă:</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color} ${status.bg}`}>
                                {status.text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <h5 className="font-medium text-gray-900 mb-2">Acțiuni disponibile:</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>📊</span>
                                <span>Vizualizează detalii complete</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>👥</span>
                                <span>Gestionează elevii</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>📝</span>
                                <span>Creează quiz-uri</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>📈</span>
                                <span>Vezi rezultate</span>
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

      {/* Form creare clasă */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
        <h3 className="text-lg font-semibold text-mulberry mb-4">
          Creează o clasă nouă
        </h3>
        <form onSubmit={handleCreateClass} className="flex gap-4">
          <input
            type="text"
            placeholder="ex: 11B"
            className="flex-1 px-3 py-2 border rounded-md border-mulberry focus:outline-none focus:ring-2 focus:ring-mulberry"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-mulberry text-white rounded-md hover:bg-purple transition"
          >
            Creează
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default TeacherDashboard;
