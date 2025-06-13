import React, { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { MetricsSelector } from '../components/dashboard/MetricsSelector'
import { LeaderboardCard } from '../components/dashboard/LeaderboardCard'
import { ClassPerformanceCard } from '../components/dashboard/ClassPerformanceCard'
import { ImprovementCard } from '../components/dashboard/ImprovementCard'
import { QuizStatsCard } from '../components/dashboard/QuizStatsCard'

export const Dashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('leaderboard')
  const renderMetricContent = () => {
    switch (selectedMetric) {
      case 'leaderboard':
        return <LeaderboardCard />
      case 'class-performance':
        return <ClassPerformanceCard />
      case 'improvements':
        return <ImprovementCard />
      case 'quiz-stats':
        return <QuizStatsCard />
      default:
        return <LeaderboardCard />
    }
  }
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#690375]">
              Professor Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[#888888]">Welcome, Prof. Johnson</span>
              <div className="w-10 h-10 rounded-full bg-[#AE847E] flex items-center justify-center text-white">
                PJ
              </div>
            </div>
          </div>
          <MetricsSelector
            activeMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
          <div className="bg-white rounded-xl shadow-md p-6">
            {renderMetricContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 