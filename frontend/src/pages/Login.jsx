import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/user/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "Eroare la login");
        return;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);

        navigate("/");
      } else {
        setError("Răspuns invalid de la server. Lipsește token-ul.");
      }
    } catch (err) {
      setError("Eroare de rețea sau server indisponibil.");
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
                 bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100"
    >
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">Autentificare</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-purple-700 text-white 
                       rounded-md hover:bg-purple-800 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
        Nu ai cont încă?{" "}
        <Link className="text-purple-600" to="/register">
            Înregistrează-te
        </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
