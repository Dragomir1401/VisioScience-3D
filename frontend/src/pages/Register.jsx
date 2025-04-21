import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const handleTyping = (setter) => (e) => {
    setter(e.target.value);
    setIsTyping(true);

    setTimeout(() => setIsTyping(false), 100);
  };

  const inputClass =
    "w-full px-4 py-2 text-sm text-black bg-white/90 border border-mulberry rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mulberry";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setRegisterClicked(true);

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      setRegisterClicked(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#DAA89B] via-[#AE847E] to-[#CB429F]">
      {/* Balon 3D */}
      <div className="absolute top-0 w-full h-[300px] z-0 pointer-events-none">
        <Canvas camera={{ fov: 40, near: 0.1, far: 1000, position: [0, 0, 5] }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[1, 2, 1]} intensity={3} />
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

      {/* Formular */}
      <div className="bg-white z-10 p-8 rounded-xl shadow-md w-full max-w-2xl mt-56">
        <h2 className="text-2xl font-bold mb-6 text-[#690375] text-center font-poppins">
          Creează un cont
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mb-4 text-center text-sm">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 font-worksans"
        >
          <div className="col-span-1">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={handleTyping(setEmail)}
              required
              placeholder="Email"
            />
          </div>

          <div className="col-span-1">
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ELEV">Elev</option>
              <option value="PROFESOR">Profesor</option>
            </select>
          </div>

          <div className="col-span-1">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={handleTyping(setPassword)}
              required
              placeholder="Parola"
            />
          </div>

          <div className="col-span-1">
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={handleTyping(setConfirmPassword)}
              required
              placeholder="Confirmă parola"
            />
          </div>

          <div className="col-span-2 text-center mt-4">
            <button
              type="submit"
              className="w-full py-2 bg-[#690375] text-white font-semibold rounded-md hover:bg-[#2C0E37] transition"
            >
              Creează cont
            </button>

            <p className="mt-6 text-black font-medium">
              Ai deja cont?{" "}
              <Link
                to="/login"
                className="text-mulberry underline hover:text-[#42023C]"
              >
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
