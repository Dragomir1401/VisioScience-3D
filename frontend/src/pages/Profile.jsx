import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import InvitesPanel from "../components/user/InvitePanel";
import StudentQuizDetails from "../components/quiz/StudentQuizDetails";

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
        const res = await fetch("http://localhost:8000/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Nu s-au putut obține datele utilizatorului.");
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

  if (loading)
    return <div className="text-center mt-12 text-mulberry">Se încarcă...</div>;
  if (error)
    return <div className="text-red-600 mt-12 text-center">{error}</div>;

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
