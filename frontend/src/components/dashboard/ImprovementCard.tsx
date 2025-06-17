import React, { useState, useEffect } from "react";
import { TrendingUpIcon, CalendarIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ImprovementCard = () => {
  const token = localStorage.getItem("token");
  const [timeRange, setTimeRange] = useState("8-weeks");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);

  const [performanceTrends, setPerformanceTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [errorTrends, setErrorTrends] = useState(null);

  const [mostImprovedStudents, setMostImprovedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/user/classes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setClasses(data);
          if (data.length > 0) {
            setSelectedClass(data[0].id);
          }
        } catch (error) {
          console.error("Eroare la preluarea claselor:", error);
        }
      }
    };
    fetchClasses();
  }, [token]);

  useEffect(() => {
    const fetchImprovementData = async () => {
      if (!selectedClass || !token) return;

      setLoadingTrends(true);
      setErrorTrends(null);
      try {
        const trendsResponse = await fetch(
          `http://localhost:8000/user/classes/${selectedClass}/performance-trends?timeRange=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!trendsResponse.ok) {
          throw new Error(`HTTP error! status: ${trendsResponse.status}`);
        }
        const trendsData = await trendsResponse.json();
        setPerformanceTrends(trendsData || []);
      } catch (error) {
        console.error("Eroare la preluarea tendințelor de performanță:", error);
        setErrorTrends(error.message);
      } finally {
        setLoadingTrends(false);
      }

      setLoadingStudents(true);
      setErrorStudents(null);
      try {
        const studentsResponse = await fetch(
          `http://localhost:8000/user/classes/${selectedClass}/most-improved-students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!studentsResponse.ok) {
          throw new Error(`HTTP error! status: ${studentsResponse.status}`);
        }
        const studentsData = await studentsResponse.json();
        setMostImprovedStudents(studentsData || []);
      } catch (error) {
        console.error("Eroare la preluarea studenților îmbunătățiți:", error);
        setErrorStudents(error.message);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchImprovementData();
  }, [selectedClass, timeRange, token]);

  const initialAvg =
    performanceTrends.length > 0 ? performanceTrends[0].average : 0;
  const currentAvg =
    performanceTrends.length > 0
      ? performanceTrends[performanceTrends.length - 1].average
      : 0;
  const overallImprovement = currentAvg - initialAvg;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUpIcon size={24} className="text-[#4f46e5]" />
          <h2 className="text-2xl font-bold text-[#690375]">
            Îmbunătățiri Studenți
          </h2>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 text-[#888888]">
            <CalendarIcon size={16} />
            <span>Interval de Timp:</span>
          </div>
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="4-weeks">Ultimele 4 Săptămâni</option>
            <option value="8-weeks">Ultimele 8 Săptămâni</option>
            <option value="12-weeks">Ultimele 12 Săptămâni</option>
            <option value="semester">Semestru Întreg</option>
          </select>
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.length > 0 ? (
              classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            ) : (
              <option value="">Nici o clasă disponibilă</option>
            )}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 col-span-3 md:col-span-1">
          <h3 className="font-semibold mb-4">Performanță Generală</h3>
          {loadingTrends ? (
            <p className="text-center text-gray-500">
              Se încarcă datele de performanță...
            </p>
          ) : errorTrends ? (
            <p className="text-center text-red-500">Eroare: {errorTrends}</p>
          ) : performanceTrends.length === 0 ? (
            <p className="text-center text-gray-500">
              Nu există date de performanță pentru clasa selectată și intervalul
              de timp.
            </p>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#888888]">Media Clasei</span>
                  <div className="flex items-center">
                    <span className="font-semibold">
                      {currentAvg.toFixed(1)}%
                    </span>
                    <span
                      className={`ml-1 text-xs ${
                        overallImprovement >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {overallImprovement >= 0 ? "↑" : "↓"}
                      {Math.abs(overallImprovement).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-[#4f46e5] h-2.5 rounded-full"
                    style={{
                      width: `${currentAvg}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#888888]">Cel Mai Bun Elev</span>
                  <div className="flex items-center">
                    <span className="font-semibold">
                      {performanceTrends[
                        performanceTrends.length - 1
                      ].topPerformer.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-[#690375] h-2.5 rounded-full"
                    style={{
                      width: `${
                        performanceTrends[performanceTrends.length - 1]
                          .topPerformer
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#888888]">Cel Mai Slab Elev</span>
                  <div className="flex items-center">
                    <span className="font-semibold">
                      {performanceTrends[
                        performanceTrends.length - 1
                      ].lowestPerformer.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-[#AE847E] h-2.5 rounded-full"
                    style={{
                      width: `${
                        performanceTrends[performanceTrends.length - 1]
                          .lowestPerformer
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 col-span-3 md:col-span-2">
          <h3 className="font-semibold mb-4">Tendințe Performanță</h3>
          {loadingTrends ? (
            <p className="text-center text-gray-500">
              Se încarcă graficul de tendințe...
            </p>
          ) : errorTrends ? (
            <p className="text-center text-red-500">
              Eroare la încărcarea graficului: {errorTrends}
            </p>
          ) : performanceTrends.length === 0 ? (
            <p className="text-center text-gray-500">
              Nu există date de tendințe pentru clasa selectată și intervalul de
              timp.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceTrends}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    name="Media Clasei"
                  />
                  <Line
                    type="monotone"
                    dataKey="topPerformer"
                    stroke="#690375"
                    strokeWidth={2}
                    name="Cel Mai Bun Elev"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowestPerformer"
                    stroke="#AE847E"
                    strokeWidth={2}
                    name="Cel Mai Slab Elev"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h3 className="font-semibold mb-4">
          Elevii cu cea Mai Mare Îmbunătățire
        </h3>
        {loadingStudents ? (
          <p className="text-center text-gray-500">
            Se încarcă elevii cu performanțe îmbunătățite...
          </p>
        ) : errorStudents ? (
          <p className="text-center text-red-500">Eroare: {errorStudents}</p>
        ) : mostImprovedStudents.length === 0 ? (
          <p className="text-center text-gray-500">
            Nu există performanțe îmbunătățite pentru clasa selectată.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                    STUDENT
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                    SCOR INIȚIAL
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                    SCOR CURENT
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                    ÎMBUNĂTĂȚIRE
                  </th>
                </tr>
              </thead>
              <tbody>
                {mostImprovedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-[#f3e8ff]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.name
                          )}&background=random&color=fff&bold=true`}
                          alt={student.name}
                          className="w-9 h-9 rounded-full mr-3"
                        />
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#888888]">
                      {student.initialScore.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {student.currentScore.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-green-500">
                        <TrendingUpIcon size={16} className="mr-1" />
                        <span className="font-semibold">
                          +{student.improvement.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovementCard;
