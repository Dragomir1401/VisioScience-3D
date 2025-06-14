import React, { useState } from 'react';
import { Box, Paper, Grid } from '@mui/material';
import ClassPerformanceCard from '../components/dashboard/ClassPerformanceCard';
import ImprovementCard from '../components/dashboard/ImprovementCard';
import LeaderboardCard from '../components/dashboard/LeaderboardCard';
import QuizStatsCard from '../components/dashboard/QuizStatsCard';
import { MetricsSelector } from '../components/dashboard/MetricsSelector';

const Analytics = () => {
  const [activeMetric, setActiveMetric] = useState('classPerformance');

  const handleMetricChange = (metric) => {
    setActiveMetric(metric);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        py: 4,
        px: { xs: 2, sm: 2, md: 2, lg: 2 },
      }}
    >
      <Box sx={{
        maxWidth: 'none',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            backgroundColor: 'transparent',
            borderRadius: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <MetricsSelector 
            activeMetric={activeMetric}
            onMetricChange={handleMetricChange}
          />
        </Paper>
        <Grid container spacing={4} justifyContent="center">
          {activeMetric === 'classPerformance' && (
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 6, 
                  height: '100%', 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minHeight: '600px',
                }}
              >
                <ClassPerformanceCard />
              </Paper>
            </Grid>
          )}
          {activeMetric === 'quizStats' && (
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 6, 
                  height: '100%', 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minHeight: '600px'
                }}
              >
                <QuizStatsCard />
              </Paper>
            </Grid>
          )}
          {activeMetric === 'improvements' && (
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 6, 
                  height: '100%', 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minHeight: '600px'
                }}
              >
                <ImprovementCard />
              </Paper>
            </Grid>
          )}
          {activeMetric === 'leaderboard' && (
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 6, 
                  height: '100%', 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minHeight: '600px'
                }}
              >
                <LeaderboardCard />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Analytics; 