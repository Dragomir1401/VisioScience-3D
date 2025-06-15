import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BadgeDisplay } from '../components/achievements/BadgeDisplay';
import { BalloonMascot } from '../components/achievements/BalloonMascot';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ACCENTS = {
  bronze: "#FFD700", // Gold neon
  silver: "#C0C0C0", // Silver neon
  gold: "#FFA500",   // Orange neon
  perfect: "#FF69B4" // Pink neon
};

// Updated mock data with neon colors
const mockBadges = [
  { id: 1, type: 'bronze', title: 'First Quiz', earned: true, position: [-6, 0, 0], color: ACCENTS.bronze },
  { id: 2, type: 'silver', title: 'Perfect Score', earned: true, position: [-3, 0, 0], color: ACCENTS.silver },
  { id: 3, type: 'gold', title: 'Quick Learner', earned: false, position: [0, 0, 0], color: ACCENTS.gold },
  { id: 4, type: 'perfect', title: 'Master Student', earned: false, position: [3, 0, 0], color: ACCENTS.perfect },
  { id: 5, type: 'bronze', title: 'Consistent', earned: false, position: [6, 0, 0], color: ACCENTS.bronze },
  { id: 6, type: 'silver', title: 'Team Player', earned: false, position: [9, 0, 0], color: ACCENTS.silver },
  { id: 7, type: 'gold', title: 'Perfect Week', earned: false, position: [12, 0, 0], color: ACCENTS.gold },
  { id: 8, type: 'perfect', title: 'Knowledge Master', earned: false, position: [15, 0, 0], color: ACCENTS.perfect },
];

const mockChallenges = [
  { id: 1, title: 'Complete 5 Quizzes', progress: 3, total: 5, reward: 'bronze' },
  { id: 2, title: 'Get 3 Perfect Scores', progress: 1, total: 3, reward: 'silver' },
  { id: 3, title: 'Complete 10 Quizzes in Under 5 Minutes', progress: 0, total: 10, reward: 'gold' },
];

export default function Achievements() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Nu s-au putut obține datele utilizatorului.');
        const userData = await res.json();
        setUser(userData);
        
        if (userData.role === 'PROFESOR') {
          navigate('/profile');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  if (loading) return <div className="text-center mt-12 text-mulberry">Se încarcă...</div>;
  if (error) return <div className="text-red-600 mt-12 text-center">{error}</div>;
  if (user?.role === 'PROFESOR') return null;

  const handleBadgeClick = (badge) => {
    if (badge.earned) {
      setSelectedBadge(badge);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPercentage = container.scrollLeft / (container.scrollWidth - container.clientWidth);
    setScrollPosition(scrollPercentage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center">Achievements & Badges</h1>
          <p className="text-indigo-300" style={{ textShadow: '0 0 5px rgba(99,102,241,0.5)' }}>
            Complete challenges to earn badges and unlock rewards!
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">Total Badges</h3>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700">
              {mockBadges.filter(b => b.earned).length}/{mockBadges.length}
            </div>
            <div className="mt-2 text-sm text-indigo-600">
              {Math.round((mockBadges.filter(b => b.earned).length / mockBadges.length) * 100)}% Complete
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">Active Challenges</h3>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {mockChallenges.length}
            </div>
            <div className="mt-2 text-sm text-purple-600">
              {mockChallenges.filter(c => c.progress > 0).length} In Progress
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">Perfect Scores</h3>
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-violet-700">
              {mockBadges.filter(b => b.type === 'perfect' && b.earned).length}
            </div>
            <div className="mt-2 text-sm text-violet-600">
              Perfect achievements unlocked
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left section - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/20 shadow-lg h-[600px] relative overflow-hidden"
          >
            <BalloonMascot 
              badges={mockBadges.map(badge => ({
                id: badge.id,
                title: badge.title,
                type: badge.type,
                earned: badge.earned,
                color: badge.color
              }))}
              onBadgeClick={(badgeId) => {
                const badge = mockBadges.find(b => b.id === badgeId);
                if (badge) {
                  setSelectedBadge(badge);
                }
              }}
            />
          </motion.div>

          {/* Right section - Challenges and Badge Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-200"
          >
            <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Active Challenges</h2>
            <div className="space-y-4">
              {mockChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/50 rounded-lg p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-indigo-900">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      challenge.reward === 'bronze' ? 'bg-amber-100 text-amber-700' :
                      challenge.reward === 'silver' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {challenge.reward.charAt(0).toUpperCase() + challenge.reward.slice(1)} Badge
                    </span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ 
                        width: `${(challenge.progress / challenge.total) * 100}%`,
                        boxShadow: '0 0 10px rgba(99,102,241,0.3)'
                      }}
                    />
                  </div>
                  <p className="text-sm text-indigo-600 mt-2">
                    Progress: {challenge.progress}/{challenge.total}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Selected Badge Details */}
            {selectedBadge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white/50 rounded-lg p-4 border border-indigo-100 shadow-sm"
              >
                <h3 className="font-semibold text-indigo-900 mb-2">Badge Details</h3>
                <p className="text-indigo-700">
                  You earned the {selectedBadge.title} badge! This badge represents your achievement
                  in completing quizzes and mastering the content. Keep up the great work!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="mt-8 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-violet-700"
          style={{ boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}
        >
          Back to Profile
        </motion.button>
      </div>
    </div>
  );
} 