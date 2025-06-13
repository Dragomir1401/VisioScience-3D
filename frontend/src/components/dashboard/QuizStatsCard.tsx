import React, { useState } from 'react'
import {
  BarChart2Icon,
  ClipboardListIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
// Mock data for quiz statistics
const quizList = [
  {
    id: 1,
    name: 'Introduction to Biology',
    completed: 32,
    avg: 85,
    difficulty: 'Medium',
  },
  {
    id: 2,
    name: 'Cell Structure',
    completed: 30,
    avg: 78,
    difficulty: 'Hard',
  },
  {
    id: 3,
    name: 'Genetics Basics',
    completed: 28,
    avg: 82,
    difficulty: 'Medium',
  },
  {
    id: 4,
    name: 'Evolution Theory',
    completed: 31,
    avg: 75,
    difficulty: 'Hard',
  },
  {
    id: 5,
    name: 'Ecology Fundamentals',
    completed: 29,
    avg: 88,
    difficulty: 'Easy',
  },
]
// Mock data for quiz completion rate
const completionRateData = [
  {
    name: 'Completed',
    value: 85,
  },
  {
    name: 'Not Started',
    value: 10,
  },
  {
    name: 'In Progress',
    value: 5,
  },
]
// Mock data for difficulty distribution
const difficultyData = [
  {
    name: 'Easy',
    count: 12,
  },
  {
    name: 'Medium',
    count: 25,
  },
  {
    name: 'Hard',
    count: 18,
  },
]
// Mock data for challenging questions
const challengingQuestions = [
  {
    id: 1,
    quiz: 'Cell Structure',
    question: 'Explain the function of mitochondria in cellular respiration',
    incorrectRate: 65,
  },
  {
    id: 2,
    quiz: 'Evolution Theory',
    question: 'Describe the concept of natural selection',
    incorrectRate: 58,
  },
  {
    id: 3,
    quiz: 'Genetics Basics',
    question: "Explain Mendel's Law of Independent Assortment",
    incorrectRate: 52,
  },
  {
    id: 4,
    quiz: 'Cell Structure',
    question: 'Describe the structure and function of the Golgi apparatus',
    incorrectRate: 48,
  },
  {
    id: 5,
    quiz: 'Evolution Theory',
    question: 'Compare and contrast homologous and analogous structures',
    incorrectRate: 45,
  },
]
const COLORS = ['#4f46e5', '#AE847E', '#888888']
export const QuizStatsCard = () => {
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2Icon size={24} className="text-[#4f46e5]" />
          <h2 className="text-2xl font-bold text-[#690375]">Quiz Statistics</h2>
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            <option value="all">All Quizzes</option>
            {quizList.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardListIcon size={18} className="text-[#4f46e5]" />
            <span>Quiz Completion Rate</span>
          </h3>
          <div className="h-48 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {completionRateData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart2Icon size={18} className="text-[#4f46e5]" />
            <span>Quiz Difficulty Distribution</span>
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={difficultyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#690375" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircleIcon size={18} className="text-[#4f46e5]" />
            <span>Average Quiz Scores</span>
          </h3>
          <div className="space-y-4">
            {quizList.map((quiz) => (
              <div key={quiz.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#888888] truncate pr-2">
                    {quiz.name}
                  </span>
                  <span className="font-semibold">{quiz.avg}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${quiz.avg >= 85 ? 'bg-green-500' : quiz.avg >= 70 ? 'bg-[#4f46e5]' : 'bg-[#AE847E]'}`}
                    style={{
                      width: `${quiz.avg}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircleIcon size={18} className="text-[#AE847E]" />
          <span>Most Challenging Questions</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                  QUIZ
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                  QUESTION
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                  INCORRECT RATE
                </th>
              </tr>
            </thead>
            <tbody>
              {challengingQuestions.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-[#f3e8ff]"
                >
                  <td className="px-4 py-4 font-medium">{item.quiz}</td>
                  <td className="px-4 py-4">{item.question}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-full max-w-[100px] bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-[#AE847E] h-2.5 rounded-full"
                          style={{
                            width: `${item.incorrectRate}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-3 font-semibold text-[#AE847E]">
                        {item.incorrectRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 