import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Nu s-au putut obține datele utilizatorului.");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="text-center mt-12 text-mulberry">Se încarcă...</div>;
  if (error) return <div className="text-red-600 mt-12 text-center">{error}</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-[#fff0f5] via-[#f3e8ff] to-[#fff7ed] px-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-mulberry w-full max-w-md">
        <h2 className="text-xl font-bold text-mulberry mb-6">Profilul tău</h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div><span className="font-semibold text-black">Email:</span> {user?.email}</div>
          <div><span className="font-semibold text-black">Rol:</span> {user?.role}</div>
          <div><span className="font-semibold text-black">ID:</span> {user?._id}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
