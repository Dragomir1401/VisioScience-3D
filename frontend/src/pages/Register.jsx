import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import RegisterBaloon from "../models/RegisterBaloon";
import Loader from "../components/Loader";

const Register = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ELEV");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [registerClicked, setRegisterClicked] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setRegisterClicked(true);

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
        setRegisterClicked(false);
        return;
      }

      setSuccessMessage("Cont creat cu succes! Te poți autentifica acum.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("ELEV");
    } catch (err) {
      setError("Eroare de rețea sau server indisponibil.");
      console.error(err);
      setRegisterClicked(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center 
             bg-gradient-to-b from-purple-300 via-violet-200 to-orange-100"
    >
      <div className="absolute top-0 w-full h-[300px] z-0 pointer-events-none">
        <Canvas camera={{ fov: 40, near: 0.1, far: 1000, position: [0, 0, 5] }}>
          <Suspense fallback={<Loader />}>
            <directionalLight position={[1, 1, 1]} intensity={4} />
            <ambientLight intensity={0.7} />
            <hemisphereLight
              skyColor="0xb1e1ff"
              groundColor="0xb1e1ff"
              intensity={1}
            />
            <RegisterBaloon
              isTyping={isTyping}
              registerClicked={registerClicked}
              setIsTyping={setIsTyping}
              setRegisterClicked={setRegisterClicked}
              position={[0, -1.1, 1.4]}
              scale={[0.4, 0.4, 0.4]}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="bg-white z-10 p-8 rounded shadow-md w-full max-w-2xl mt-56">
        <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div className="col-span-1">
            <label className="block mb-1 text-gray-700">Email:</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsTyping((prev) => !prev);
              }}
              required
              placeholder="ex: user@example.com"
            />
          </div>

          {/* Rol */}
          <div className="col-span-1">
            <label className="block mb-1 text-gray-700">Rol:</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ELEV">Elev</option>
              <option value="PROFESOR">Profesor</option>
            </select>
          </div>

          {/* Parola */}
          <div className="col-span-1">
            <label className="block mb-1 text-gray-700">Parola:</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsTyping((prev) => !prev);
              }}
              required
              placeholder="******"
            />
          </div>

          {/* Confirm Parola */}
          <div className="col-span-1">
            <label className="block mb-1 text-gray-700">Confirmă parola:</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setIsTyping((prev) => !prev);
              }}
              required
              placeholder="******"
            />
          </div>

          {/* Butonul și link-ul */}
          <div className="col-span-2 text-center mt-4">
            <button
              type="submit"
              className="w-full py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
            >
              Creează cont
            </button>

            <p className="mt-6 text-gray-700">
              Ai deja cont?{" "}
              <Link to="/login" className="text-purple-600 hover:underline">
                Conectează-te
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
