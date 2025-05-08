import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import LoginBaloon from "../models/LoginBaloon";
import Loader from "../components/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  const [error, setError] = useState("");

  const parseJwt = (token) => {
    if (!token) {
      console.error("Token invalid.");
      return null;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Eroare la decodarea tokenului:", err);
      return null;
    }
  };

  const navigate = useNavigate();

  const inputClass =
    "w-full px-4 py-2 text-sm text-black bg-white/90 border border-mulberry rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mulberry";

  const handleTyping = (setter) => (e) => {
    setter(e.target.value);
    setIsTyping(true);

    setTimeout(() => setIsTyping(false), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoginClicked(true);

    try {
      const response = await fetch("http://localhost:8000/user/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "Eroare la login");
        setLoginClicked(false);
        return;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);

        const decoded = parseJwt(data.token);
        if (decoded && decoded.user_id) {
          localStorage.setItem("userId", decoded.user_id);
        } else {
          setError("Token invalid. Nu s-a putut extrage userId.");
          setLoginClicked(false);
          return;
        }

        setTimeout(() => navigate("/"), 2500);
      } else {
        setError("Răspuns invalid de la server. Lipsește token-ul.");
        setLoginClicked(false);
      }
    } catch (err) {
      setError("Eroare de rețea sau server indisponibil.");
      setLoginClicked(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#DAA89B] via-[#AE847E] to-[#CB429F]">
      <div className="absolute top-0 w-full h-[300px] z-0 pointer-events-none">
        <Canvas camera={{ fov: 40, near: 0.1, far: 1000, position: [0, 0, 5] }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[1, 2, 1]} intensity={3} />
            <LoginBaloon
              isTyping={isTyping}
              loginClicked={loginClicked}
              setIsTyping={setIsTyping}
              setLoginClicked={setLoginClicked}
              position={[0, -1.1, 1.4]}
              scale={[0.4, 0.4, 0.4]}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 bg-white p-8 rounded-xl shadow-md w-full max-w-md mt-48">
        <h2 className="text-2xl font-bold mb-6 text-[#690375] text-center font-poppins">
          Autentificare
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-worksans">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleTyping(setEmail)}
            className={inputClass}
          />

          <input
            type="password"
            name="password"
            placeholder="Parola"
            value={password}
            onChange={handleTyping(setPassword)}
            className={inputClass}
          />

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-[#690375] text-white font-semibold 
              rounded-md hover:bg-[#2C0E37] transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-black font-medium">
          Nu ai cont?{" "}
          <Link
            to="/register"
            className="text-mulberry underline hover:text-[#42023C]"
          >
            Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
