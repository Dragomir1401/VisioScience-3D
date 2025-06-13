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
          <MetricsSelector
            activeMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
          <div className="bg-white rounded-xl shadow-md p-12">
            {renderMetricContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 