import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import InvitesPanel from "../components/user/InvitePanel";
import StudentQuizDetails from "../components/quiz/StudentQuizDetails";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate             = useNavigate();

  // preluăm token și userId o singură dată
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    (async () => {
      try {
        if (!token) {
          setError("Nu ești autentificat. Te rog să te conectezi pentru a vedea profilul.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 401 || res.status === 403) {
          // Clear invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setError("Sesiunea ta a expirat. Te rog să te conectezi din nou.");
          setLoading(false);
          return;
        }
        
        if (!res.ok) {
          throw new Error(`Eroare ${res.status}: Nu s-au putut obține datele utilizatorului.`);
        }
        
        setUser(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleViewAchievements = () => {
    if (user) {
      navigate('/achievements', { state: { user } });
    }
  };

  if (loading)
    return <div className="text-center mt-12 text-mulberry">Se încarcă...</div>;
  
  if (error) {
    const isAuthError = error.includes("autentificat") || error.includes("Sesiunea") || error.includes("401") || error.includes("403");
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-purple-100 p-12 shadow-xl text-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl opacity-50"></div>
            
            {/* Main content */}
            <div className="relative z-10">
              {/* Icon/Illustration */}
              <div className="mb-8">
                {isAuthError ? (
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {isAuthError ? "Bun venit înapoi!" : "Ooops! Ceva nu a mers bine"}
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {isAuthError 
                  ? "Pentru a vedea profilul tău și a accesa toate funcționalitățile, te rog să te conectezi la contul tău."
                  : "A apărut o problemă în timpul încărcării datelor. Te rugăm să încerci din nou."
                }
              </p>

              {/* Error details (only for non-auth errors) */}
              {!isAuthError && (
                <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
                  <p className="text-sm text-gray-500 font-mono">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthError ? (
                  <>
                    <button
                      onClick={handleLoginRedirect}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Conectează-te
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-white border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold text-lg"
                    >
                      Mergi la pagina principală
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Încearcă din nou
                  </button>
                )}
              </div>

              {/* Additional info for auth errors */}
              {isAuthError && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Nu ai cont? <button onClick={() => navigate("/register")} className="text-purple-600 hover:text-purple-700 font-medium">Creează unul aici</button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-6 pt-24">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Profil */}
        <div className="bg-white rounded-xl border border-mulberry p-6 shadow-md w-full lg:w-1/3">
          <h2 className="text-xl font-bold text-mulberry mb-4">Profilul tău</h2>
          <div className="space-y-2 text-sm text-gray-800">
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">Rol:</span> {user.role}</p>
            <p><span className="font-semibold">ID:</span> {user.id}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition text-sm"
          >
            Deconectează-te
          </button>
          {user.role === "ELEV" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAchievements}
              className="w-full mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-violet-700"
            >
              Vezi Realizări
            </motion.button>
          )}
        </div>

        {/* Invitații + Dashboard / Quiz-uri */}
        <div className="flex flex-col gap-6 w-full lg:w-2/3">
          <div className="bg-white rounded-xl border border-mulberry p-6 shadow-sm">
            <h3 className="text-md font-semibold text-mulberry mb-4">Invitații primite</h3>
            <InvitesPanel />
          </div>

          {user.role === "PROFESOR" && (
            <div className="bg-white rounded-xl border border-mulberry p-6 shadow-sm">
              <h3 className="text-md font-semibold text-mulberry mb-4">Dashboard profesor</h3>
              <TeacherDashboard />
            </div>
          )}

          {user.role === "ELEV" && user.classes?.length > 0 && (
            <div className="bg-white rounded-xl border border-mulberry p-6 shadow-sm space-y-4">
              <h3 className="text-md font-semibold text-mulberry">Clasa mea</h3>
              <p className="text-sm">
                ID clasă: <code className="font-mono">{user.classes[0]}</code>
              </p>
              <h4 className="text-sm font-semibold text-purple-700 mt-4">
                Quiz-uri disponibile
              </h4>
              <StudentQuizDetails
                classId={user.classes[0]}
                userId={user.id}
                token={token}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
