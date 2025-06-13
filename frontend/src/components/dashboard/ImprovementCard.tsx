import React, { useState } from 'react'
import { TrendingUpIcon, CalendarIcon } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
// Mock data for improvement trends
const improvementData = [
  {
    name: 'Săptămâna 1',
    average: 65,
    topPerformer: 82,
    lowestPerformer: 45,
  },
  {
    name: 'Săptămâna 2',
    average: 68,
    topPerformer: 85,
    lowestPerformer: 48,
  },
  {
    name: 'Săptămâna 3',
    average: 70,
    topPerformer: 88,
    lowestPerformer: 52,
  },
  {
    name: 'Săptămâna 4',
    average: 72,
    topPerformer: 90,
    lowestPerformer: 55,
  },
  {
    name: 'Săptămâna 5',
    average: 75,
    topPerformer: 92,
    lowestPerformer: 58,
  },
  {
    name: 'Săptămâna 6',
    average: 77,
    topPerformer: 94,
    lowestPerformer: 62,
  },
  {
    name: 'Săptămâna 7',
    average: 80,
    topPerformer: 96,
    lowestPerformer: 65,
  },
  {
    name: 'Săptămâna 8',
    average: 82,
    topPerformer: 98,
    lowestPerformer: 68,
  },
]
// Mock data for most improved students
const mostImprovedStudents = [
  {
    id: 1,
    name: 'Ryan Cooper',
    initialScore: 58,
    currentScore: 82,
    improvement: 24,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    id: 2,
    name: 'Mia Jackson',
    initialScore: 62,
    currentScore: 85,
    improvement: 23,
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 3,
    name: 'Tyler Reed',
    initialScore: 65,
    currentScore: 87,
    improvement: 22,
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    id: 4,
    name: 'Zoe Parker',
    initialScore: 60,
    currentScore: 81,
    improvement: 21,
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
  },
  {
    id: 5,
    name: 'Ethan Brooks',
    initialScore: 68,
    currentScore: 88,
    improvement: 20,
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
  },
]
export const ImprovementCard = () => {
  const [timeRange, setTimeRange] = useState('8-weeks')
  // Calculate overall improvement
  const initialAvg = improvementData[0].average
  const currentAvg = improvementData[improvementData.length - 1].average
  const overallImprovement = currentAvg - initialAvg
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
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 col-span-3 md:col-span-1">
          <h3 className="font-semibold mb-4">Performanță Generală</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#888888]">Media Clasei</span>
                <div className="flex items-center">
                  <span className="font-semibold">{currentAvg}%</span>
                  <span className="ml-1 text-green-500 text-xs">
                    ↑{overallImprovement}%
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
                <span className="text-[#888888]">Cel Mai Bun Performant</span>
                <div className="flex items-center">
                  <span className="font-semibold">
                    {improvementData[improvementData.length - 1].topPerformer}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-[#690375] h-2.5 rounded-full"
                  style={{
                    width: `${improvementData[improvementData.length - 1].topPerformer}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#888888]">Cel Mai Slab Performant</span>
                <div className="flex items-center">
                  <span className="font-semibold">
                    {
                      improvementData[improvementData.length - 1]
                        .lowestPerformer
                    }
                    %
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-[#AE847E] h-2.5 rounded-full"
                  style={{
                    width: `${improvementData[improvementData.length - 1].lowestPerformer}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 col-span-3 md:col-span-2">
          <h3 className="font-semibold mb-4">Tendințe Performanță</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={improvementData}
                margin={{
                  top: 5,
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
                  name="Cel Mai Bun Performant"
                />
                <Line
                  type="monotone"
                  dataKey="lowestPerformer"
                  stroke="#AE847E"
                  strokeWidth={2}
                  name="Cel Mai Slab Performant"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h3 className="font-semibold mb-4">Studenți cu cea Mai Mare Îmbunătățire</h3>
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
                        src={student.avatar}
                        alt={student.name}
                        className="w-9 h-9 rounded-full mr-3"
                      />
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#888888]">
                    {student.initialScore}%
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {student.currentScore}%
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-green-500">
                      <TrendingUpIcon size={16} className="mr-1" />
                      <span className="font-semibold">
                        +{student.improvement}%
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