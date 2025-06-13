import React from 'react';
import {
  TrophyIcon,
  UsersIcon,
  TrendingUpIcon,
  BarChart2Icon,
} from 'lucide-react';

interface MetricsSelectorProps {
  activeMetric: string;
  onMetricChange: (metric: string) => void;
}

const metrics = [
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: <TrophyIcon size={18} />,
  },
  {
    id: 'classPerformance',
    label: 'Class Performance',
    icon: <UsersIcon size={18} />,
  },
  {
    id: 'improvements',
    label: 'Improvements',
    icon: <TrendingUpIcon size={18} />,
  },
  {
    id: 'quizStats',
    label: 'Quiz Statistics',
    icon: <BarChart2Icon size={18} />,
  },
];

export const MetricsSelector = ({ activeMetric, onMetricChange }: MetricsSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            activeMetric === metric.id 
              ? 'bg-[#690375] text-white shadow-md' 
              : 'bg-white text-[#888888] hover:bg-[#f3e8ff] hover:text-[#690375]'
          }`}
          onClick={() => onMetricChange(metric.id)}
        >
          <span
            className={
              activeMetric === metric.id ? 'text-white' : 'text-[#690375]'
            }
          >
            {metric.icon}
          </span>
          <span className="font-medium">{metric.label}</span>
        </button>
      ))}
    </div>
  );
}; 