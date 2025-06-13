import React, { useState } from 'react'
import { UsersIcon, ChevronDownIcon, BarChart2Icon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
// Mock data for class performance
const classPerformanceData = [
  {
    id: 'class-a',
    name: 'Clasa A',
    avgScore: 85,
    totalStudents: 32,
    quizzesTaken: 256,
    improvement: '+5%',
  },
  {
    id: 'class-b',
    name: 'Clasa B',
    avgScore: 78,
    totalStudents: 28,
    quizzesTaken: 224,
    improvement: '+3%',
  },
  {
    id: 'class-c',
    name: 'Clasa C',
    avgScore: 92,
    totalStudents: 25,
    quizzesTaken: 200,
    improvement: '+8%',
  },
  {
    id: 'class-d',
    name: 'Clasa D',
    avgScore: 71,
    totalStudents: 30,
    quizzesTaken: 240,
    improvement: '+2%',
  },
]
// Mock data for charts
const quizScoresByClass = [
  {
    name: 'Quiz 1',
    'Clasa A': 75,
    'Clasa B': 65,
    'Clasa C': 85,
    'Clasa D': 68,
  },
  {
    name: 'Quiz 2',
    'Clasa A': 79,
    'Clasa B': 70,
    'Clasa C': 88,
    'Clasa D': 72,
  },
  {
    name: 'Quiz 3',
    'Clasa A': 82,
    'Clasa B': 74,
    'Clasa C': 90,
    'Clasa D': 75,
  },
  {
    name: 'Quiz 4',
    'Clasa A': 85,
    'Clasa B': 78,
    'Clasa C': 92,
    'Clasa D': 71,
  },
]
export const ClassPerformanceCard = () => {
  const [selectedClass, setSelectedClass] = useState('all')
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
            <option value="all">Toate Clasele</option>
            {classPerformanceData.map((classData) => (
              <option key={classData.id} value={classData.id}>
                {classData.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classPerformanceData.map((classData) => (
          <div
            key={classData.id}
            className={`bg-white p-6 rounded-xl border ${
              selectedClass === classData.id || selectedClass === 'all'
                ? 'border-[#4f46e5] shadow-md'
                : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-xl">{classData.name}</h3>
                <p className="text-[#888888] text-base">
                  {classData.totalStudents} studenți
                </p>
              </div>
              <div className="bg-[#f3e8ff] text-[#690375] font-medium px-3 py-1.5 rounded-md text-base">
                {classData.improvement}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-base mb-2">
                <span className="text-[#888888]">Scor Mediu</span>
                <span className="font-semibold">{classData.avgScore}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#4f46e5] h-3 rounded-full"
                  style={{
                    width: `${classData.avgScore}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <BarChart2Icon size={24} className="text-[#4f46e5]" />
          <h3 className="font-semibold text-xl">Performanța Quiz-urilor pe Clasă</h3>
        </div>
        <div className="h-[500px]">
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
              <Bar dataKey="Clasa A" fill="#4f46e5" />
              <Bar dataKey="Clasa B" fill="#AE847E" />
              <Bar dataKey="Clasa C" fill="#690375" />
              <Bar dataKey="Clasa D" fill="#888888" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 