import React, { useEffect, useState } from 'react'
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
import axios from 'axios'

interface QuizStats {
  id: string
  title: string
  completed: number
  avg: number
  difficulty: string
  total_users: number
  in_progress: number
  not_started: number
  challenging_questions: {
    question: string
    incorrect_rate: number
  }[]
}

interface ChallengingQuestion {
  question: string
  incorrect_rate: number
}

interface QuizOption {
  id: string
  name: string
}

const COLORS = ['#4f46e5', '#AE847E', '#888888']

const QuizStatsCard = () => {
  const [overallStats, setOverallStats] = useState<QuizStats[]>([])
  const [quizListOptions, setQuizListOptions] = useState<QuizOption[]>([{ id: 'all', name: 'Toate Quiz-urile' }])
  const [selectedQuizId, setSelectedQuizId] = useState('all')
  const [challengingQuestionsData, setChallengingQuestionsData] = useState<ChallengingQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchOverallStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user/quiz/statistics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setOverallStats(response.data || [])
        const options = response.data.map((quiz: QuizStats) => ({ id: quiz.id, name: quiz.title }))
        setQuizListOptions([{ id: 'all', name: 'Toate Quiz-urile' }, ...options])
      } catch (err: any) {
        setError('Failed to load overall quiz statistics: ' + err.message)
        console.error('Error fetching overall quiz stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOverallStats()
  }, [token])

  useEffect(() => {
    const fetchChallengingQuestions = async () => {
      if (selectedQuizId === 'all') {
        setChallengingQuestionsData([])
        return
      }

      try {
        const response = await axios.get(`http://localhost:8000/user/quiz/${selectedQuizId}/challenging-questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setChallengingQuestionsData(response.data || [])
      } catch (err: any) {
        console.error('Error fetching challenging questions:', err)
        setChallengingQuestionsData([])
      }
    }

    fetchChallengingQuestions()
  }, [selectedQuizId, token])

  const currentQuizStats = overallStats.find(quiz => quiz.id === selectedQuizId)

  // Prepare data for completion rate Pie Chart
  const completionRateData = selectedQuizId === 'all'
    ? [
        { name: 'Completate', value: overallStats.reduce((sum, q) => sum + q.completed, 0) },
        { name: 'Neîncepute', value: overallStats.reduce((sum, q) => sum + q.not_started, 0) },
        { name: 'În Progres', value: overallStats.reduce((sum, q) => sum + q.in_progress, 0) },
      ]
    : [
        { name: 'Completate', value: currentQuizStats?.completed || 0 },
        { name: 'Neîncepute', value: currentQuizStats?.not_started || 0 },
        { name: 'În Progres', value: currentQuizStats?.in_progress || 0 },
      ];

  // Prepare data for difficulty distribution Bar Chart
  const difficultyDataMap = overallStats.reduce((acc, quiz) => {
    acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const difficultyData = Object.keys(difficultyDataMap).map(difficulty => ({
    name: difficulty,
    count: difficultyDataMap[difficulty]
  }));

  if (loading) {
    return <p className="pt-24 text-center text-mulberry">Se încarcă statisticile quiz-urilor...</p>
  }

  if (error) {
    return <p className="pt-24 text-center text-red-600">Eroare: {error}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2Icon size={24} className="text-[#4f46e5]" />
          <h2 className="text-2xl font-bold text-[#690375]">Statistici Quiz</h2>
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            {quizListOptions.map((quiz) => (
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
            <span>Rata de Completare a Quiz-urilor</span>
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
            <span>Distribuția Dificultății Quiz-urilor</span>
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
            <span>Scoruri Medii Quiz-uri</span>
          </h3>
          <div className="space-y-4">
            {overallStats.map((quiz) => (
              <div key={quiz.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#888888] truncate pr-2">
                    {quiz.title}
                  </span>
                  <span className="font-semibold">{quiz.avg.toFixed(1)}%</span>
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
          <span>Cele Mai Dificile Întrebări</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                  ÎNTREBARE
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#888888]">
                  RATĂ GREȘELI
                </th>
              </tr>
            </thead>
            <tbody>
              {(selectedQuizId === 'all' ? [] : challengingQuestionsData).map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-[#f3e8ff]"
                >
                  <td className="px-4 py-4">{item.question}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-full max-w-[100px] bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-[#AE847E] h-2.5 rounded-full"
                          style={{
                            width: `${item.incorrect_rate}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-3 font-semibold text-[#AE847E]">
                        {item.incorrect_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {selectedQuizId === 'all' && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                    Selectați un quiz pentru a vedea întrebările dificile.
                  </td>
                </tr>
              )}
              {selectedQuizId !== 'all' && challengingQuestionsData.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                    Nu există întrebări dificile pentru acest quiz încă.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default QuizStatsCard; 