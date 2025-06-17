import React, { useEffect, useState } from "react";
import { UsersIcon, ChevronDownIcon, BarChart2Icon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ClassPerformanceSummary {
  class_id: string;
  class_name: string;
  average_score: number;
  total_students: number;
  quizzes_taken: number;
  improvement: string;
}

interface QuizPerformance {
  quiz_id: string;
  quiz_title: string;
  average_score: number;
  total_attempts: number;
}

interface ClassFilter {
  id: string;
  name: string;
}

const ClassPerformanceCard = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedClassForGraph, setSelectedClassForGraph] = useState("all");
  const [classPerformanceData, setClassPerformanceData] = useState<
    ClassPerformanceSummary[]
  >([]);
  const [quizPerformanceData, setQuizPerformanceData] = useState<
    QuizPerformance[]
  >([]);
  const [classFilters, setClassFilters] = useState<ClassFilter[]>([
    { id: "all", name: "Toate Clasele" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("http://localhost:8000/user/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any[] = await response.json();
        const fetchedClasses: ClassFilter[] = data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
        }));
        setClassFilters((prev) => [
          { id: "all", name: "Toate Clasele" },
          ...fetchedClasses,
        ]);
      } catch (e: any) {
        console.error("Failed to fetch classes:", e);
      }
    };
    fetchClasses();
  }, [token]);

  useEffect(() => {
    const fetchClassPerformance = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:8000/user/classes/performance`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ClassPerformanceSummary[] = await response.json();
        setClassPerformanceData(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassPerformance();
  }, [token]);

  useEffect(() => {
    const fetchQuizPerformance = async () => {
      if (selectedClassForGraph === "all") {
        setQuizPerformanceData([]);
        return;
      }

      try {
        const url = `http://localhost:8000/user/classes/${selectedClassForGraph}/quiz-performance`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: QuizPerformance[] = await response.json();
        setQuizPerformanceData(data || []);
      } catch (e: any) {
        console.error("Failed to fetch quiz performance:", e);
        setQuizPerformanceData([]);
      }
    };

    fetchQuizPerformance();
  }, [selectedClassForGraph, token]);

  const filteredClassPerformance =
    selectedClass === "all"
      ? classPerformanceData
      : classPerformanceData.filter((cls) => cls.class_id === selectedClass);

  const quizScoresByClass =
    quizPerformanceData.length > 0
      ? [
          {
            name: "Performanța Quiz-urilor",
            ...quizPerformanceData.reduce((acc, quiz) => {
              acc[quiz.quiz_title] = quiz.average_score;
              return acc;
            }, {} as Record<string, number>),
          },
        ]
      : [];

  const getImprovementColor = (improvement: string) => {
    if (improvement.startsWith("↑")) {
      return "text-green-500";
    } else if (improvement.startsWith("↓")) {
      return "text-red-500";
    } else if (improvement === "Stabil") {
      return "text-yellow-500";
    }
    return "text-gray-500";
  };

  if (loading) {
    return (
      <p className="pt-24 text-center text-mulberry">
        Se încarcă performanța claselor...
      </p>
    );
  }

  if (error) {
    return (
      <p className="pt-24 text-center text-red-600">
        Eroare la încărcarea performanței claselor: {error}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon size={28} className="text-[#4f46e5]" />
          <h2 className="text-3xl font-bold text-[#690375]">
            Performanța Clasei
          </h2>
        </div>
        <div className="flex gap-4">
          <select
            className="px-6 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-lg"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classFilters.map((classData) => (
              <option key={classData.id} value={classData.id}>
                {classData.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredClassPerformance.map((classData) => (
          <div
            key={classData.class_id}
            className={`bg-white p-6 rounded-xl border ${
              selectedClass === classData.class_id || selectedClass === "all"
                ? "border-[#4f46e5] shadow-md"
                : "border-gray-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-xl">
                  {classData.class_name}
                </h3>
                <p className="text-[#888888] text-base">
                  {classData.total_students} studenți
                </p>
              </div>
              <div
                className={`bg-[#f3e8ff] text-[#690375] font-medium px-3 py-1.5 rounded-md text-base ${getImprovementColor(
                  classData.improvement
                )}`}
              >
                {classData.improvement}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-base mb-2">
                <span className="text-[#888888]">Scor Mediu</span>
                <span className="font-semibold">
                  {classData.average_score.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#4f46e5] h-3 rounded-full"
                  style={{
                    width: `${classData.average_score}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart2Icon size={24} className="text-[#4f46e5]" />
            <h3 className="font-semibold text-xl">
              Performanța Quiz-urilor pe Clasă
            </h3>
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-base"
            value={selectedClassForGraph}
            onChange={(e) => setSelectedClassForGraph(e.target.value)}
          >
            {classFilters.map((classData) => (
              <option key={classData.id} value={classData.id}>
                {classData.name}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[500px]">
          {quizPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quizScoresByClass}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {Object.keys(quizScoresByClass[0])
                  .filter((key) => key !== "name")
                  .map((quizTitle, index) => (
                    <Bar
                      key={quizTitle}
                      dataKey={quizTitle}
                      fill={
                        ["#4f46e5", "#AE847E", "#690375", "#888888"][index % 4]
                      }
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {selectedClassForGraph === "all"
                ? "Selectați o clasă pentru a vedea performanța quiz-urilor"
                : "Nu există date de performanță pentru această clasă"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassPerformanceCard;
