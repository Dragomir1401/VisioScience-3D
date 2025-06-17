import React, { useState, useEffect } from "react";
import { BalloonMascot } from "../components/achievements/BalloonMascot";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ACCENTS = {
  bronze: "#FFD700", // Gold neon
  silver: "#C0C0C0", // Silver neon
  gold: "#FFA500", // Orange neon
  perfect: "#FF69B4", // Pink neon
};

// Helper pentru a obține badge-ul cu progresul maxim sau câștigat pentru fiecare tip
function getUniqueBadgesByType(badges) {
  const map = {};
  badges.forEach((badge) => {
    if (!map[badge.type]) {
      map[badge.type] = badge;
    } else {
      // Preferă badge-ul câștigat, apoi progresul cel mai mare
      if (badge.earned && !map[badge.type].earned) {
        map[badge.type] = badge;
      } else if (badge.progress > map[badge.type].progress) {
        map[badge.type] = badge;
      }
    }
  });
  return Object.values(map);
}

function Achievements() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("http://localhost:8000/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUserData(userData);

        if (userData.role === "PROFESOR") {
          navigate("/profile");
        }

        // Fetch badges
        const badgesResponse = await fetch(
          `http://localhost:8000/user/badges/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!badgesResponse.ok) {
          throw new Error("Failed to fetch badges");
        }

        const badgesData = await badgesResponse.json();
        console.log("Raw badge data:", badgesData);

        // Transform badge data to match the expected format
        const transformedBadges = badgesData.map((badge) => ({
          id: badge.badge.id,
          title: badge.badge.title,
          description: badge.badge.description,
          type: badge.badge.type,
          icon: badge.badge.icon,
          earned: badge.earned,
          progress: Math.min(badge.progress, 100),
          color: ACCENTS[badge.badge.type?.toLowerCase()] || ACCENTS.perfect,
        }));

        console.log("Transformed badges:", transformedBadges);
        setBadges(transformedBadges);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleBadgeClick = (badgeId) => {
    const badge = badges.find((b) => b.id === badgeId);
    if (badge) {
      setSelectedBadge(badge);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 flex items-center justify-center">
        <div className="text-indigo-900 text-xl">Loading achievements...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );

  if (userData?.role === "PROFESOR") return null;

  const earnedBadges = badges.filter((badge) => badge.earned).length;
  const activeChallenges = badges.filter(
    (badge) => !badge.earned && badge.progress > 0
  ).length;
  const perfectScores = badges.filter(
    (badge) => badge.type === "perfect" && badge.earned
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center">
            Recompense și Badge-uri
          </h1>
          <p
            className="text-indigo-300"
            style={{ textShadow: "0 0 5px rgba(99,102,241,0.5)" }}
          >
            Completează quiz-urile pentru a câștiga recompense!
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
              <h3 className="text-lg font-semibold text-indigo-900">
                Total Badge-uri
              </h3>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700">
              {earnedBadges}/{badges.length}
            </div>
            <div className="mt-2 text-sm text-indigo-600">
              {Math.round((earnedBadges / badges.length) * 100)}% Completate
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">
                Challenge-uri Active
              </h3>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {activeChallenges}
            </div>
            <div className="mt-2 text-sm text-purple-600">
              {activeChallenges} În Progres
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">
                Scor perfect
              </h3>
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-violet-700">
              {perfectScores}
            </div>
            <div className="mt-2 text-sm text-violet-600">
              Recompensele perfecte
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left section - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a0b2e] rounded-xl p-4 border border-indigo-200/20 shadow-lg h-[600px] relative overflow-hidden"
          >
            <BalloonMascot
              badges={getUniqueBadgesByType(
                badges.filter((b) => b.earned || b.progress === 100)
              )}
              onBadgeClick={handleBadgeClick}
            />
          </motion.div>

          {/* Right section - Challenges and Badge Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-200"
          >
            <h2 className="text-2xl font-semibold text-indigo-900 mb-6">
              Challenge-uri Active
            </h2>
            <div className="space-y-4">
              {badges
                .filter((badge) => !badge.earned && badge.progress > 0)
                .map((badge) => (
                  <motion.div
                    key={badge.id || badge.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/50 rounded-lg p-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => handleBadgeClick(badge.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-indigo-900">
                        {badge.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          badge.type === "bronze"
                            ? "bg-amber-100 text-amber-700"
                            : badge.type === "silver"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {badge.type.charAt(0).toUpperCase() +
                          badge.type.slice(1)}{" "}
                        Badge
                      </span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{
                          width: `${Math.min(badge.progress, 100)}%`,
                          boxShadow: "0 0 10px rgba(99,102,241,0.3)",
                        }}
                      />
                    </div>
                    <p className="text-sm text-indigo-600 mt-2">
                      Progress: {Math.round(Math.min(badge.progress, 100))}%
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
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{selectedBadge.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-900">
                      {selectedBadge.title}
                    </h3>
                    <p className="text-indigo-700">
                      {selectedBadge.description}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2.5 mb-2">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{
                      width: `${Math.min(selectedBadge.progress, 100)}%`,
                      boxShadow: "0 0 10px rgba(99,102,241,0.3)",
                    }}
                  />
                </div>
                <p className="text-sm text-indigo-600">
                  Progress: {Math.round(Math.min(selectedBadge.progress, 100))}%
                  {selectedBadge.earned && " (Completat!)"}
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
          style={{ boxShadow: "0 0 15px rgba(99,102,241,0.3)" }}
        >
          Înapoi la Profil
        </motion.button>
      </div>
    </div>
  );
}

export default Achievements;
