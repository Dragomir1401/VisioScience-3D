import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ELEV"); // rol implicit, ex. 'ELEV' sau 'PROFESOR'
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Mic check local pentru parola
    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/user/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "Eroare la înregistrare.");
        return;
      }

      // Daca a mers OK:
      setSuccessMessage("Cont creat cu succes! Te poți autentifica acum.");
      // Reset inputurile
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("ELEV");

      // (Opțional) navighează direct la "/login"
      // navigate("/login");
    } catch (err) {
      setError("Eroare de rețea sau server indisponibil.");
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center 
                 bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100"
    >
      {/* Element pseudo-3D sau un background animat */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Poți adăuga un model 3D integrat, un canvas, sau un efect animat */}
        {/* Exemplu simplu: un gradient animat sau "bule" */}
      </div>

      <div className="bg-white z-10 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">
          Creează un cont
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-gray-700" htmlFor="email">
              Email:
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ex: user@example.com"
            />
          </div>

          {/* Rol (ELEV sau PROFESOR) */}
          <div>
            <label className="block mb-1 text-gray-700" htmlFor="role">
              Rol:
            </label>
            <select
              id="role"
              className="w-full px-3 py-2 border rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ELEV">Elev</option>
              <option value="PROFESOR">Profesor</option>
            </select>
          </div>

          {/* Parola */}
          <div>
            <label className="block mb-1 text-gray-700" htmlFor="password">
              Parola:
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="******"
            />
          </div>

          {/* Confirm parola */}
          <div>
            <label className="block mb-1 text-gray-700" htmlFor="confirmPassword">
              Confirmă parola:
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-purple-700 text-white 
                       rounded-md hover:bg-purple-800 transition"
          >
            Creează cont
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
