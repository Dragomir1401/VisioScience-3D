import React, { useState } from 'react'
import {
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from 'lucide-react'
// Mock data for the leaderboard
const leaderboardData = [
  {
    id: 1,
    name: 'Emma Thompson',
    score: 98,
    quizzesTaken: 12,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'James Wilson',
    score: 95,
    quizzesTaken: 15,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 3,
    name: 'Sophia Rodriguez',
    score: 92,
    quizzesTaken: 14,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 4,
    name: 'Liam Johnson',
    score: 90,
    quizzesTaken: 13,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 5,
    name: 'Olivia Martinez',
    score: 89,
    quizzesTaken: 15,
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
  },
  {
    id: 6,
    name: 'Noah Garcia',
    score: 87,
    quizzesTaken: 11,
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    id: 7,
    name: 'Ava Brown',
    score: 85,
    quizzesTaken: 14,
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    id: 8,
    name: 'William Davis',
    score: 83,
    quizzesTaken: 12,
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
  },
  {
    id: 9,
    name: 'Isabella Smith',
    score: 81,
    quizzesTaken: 13,
    avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
  },
  {
    id: 10,
    name: 'Benjamin Jones',
    score: 80,
    quizzesTaken: 10,
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
  },
]
export const LeaderboardCard = () => {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  // Mock class filters
  const classFilters = [
    {
      id: 'all',
      name: 'All Classes',
    },
    {
      id: 'class-a',
      name: 'Class A',
    },
    {
      id: 'class-b',
      name: 'Class B',
    },
    {
      id: 'class-c',
      name: 'Class C',
    },
  ]
  const filteredData = leaderboardData.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TrophyIcon size={24} className="text-[#4f46e5]" />
          <h2 className="text-2xl font-bold text-[#690375]">
            Student Leaderboard
          </h2>
        </div>
        <div className="flex gap-10 px-20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-[#888888]" />
            </div>
            <input
              type="text"
              placeholder="Search student..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {classFilters.map((classFilter) => (
              <option key={classFilter.id} value={classFilter.id}>
                {classFilter.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-5 py-3 text-left text-sm font-medium text-[#888888]">
                RANK
              </th>
              <th className="px-20 py-3 text-left text-sm font-medium text-[#888888]">
                STUDENT
              </th>
              <th className="px-20 py-3 text-left text-sm font-medium text-[#888888]">
                SCORE
              </th>
              <th className="px-1 py-3 text-left text-sm font-medium text-[#888888]">
                QUIZZES TAKEN
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, index) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-[#f3e8ff]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-opacity-20 font-semibold text-sm">
                    {index === 0 ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-yellow-500" />
                      </div>
                    ) : index === 1 ? (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-gray-500" />
                      </div>
                    ) : index === 2 ? (
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-amber-600" />
                      </div>
                    ) : (
                      <span className="text-[#888888]">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-20 py-4">
                  <div className="flex items-center">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-9 h-9 rounded-full mr-3"
                    />
                    <span className="font-medium">{student.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <div className="flex items-center">
                    <div className="w-full max-w-[100px] bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-[#4f46e5] h-2.5 rounded-full"
                        style={{
                          width: `${student.score}%`,
                        }}
                      ></div>
                    </div>
                    <span className="ml-3 font-semibold">{student.score}%</span>
                  </div>
                </td>
                <td className="px-10 py-4 text-[#888888]">
                  {student.quizzesTaken}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 