import React from "react";
import { Canvas } from "@react-three/fiber";
import ContactBaloon from "../models/ContactBaloon";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--melon)] via-[var(--rosy-brown)] to-[var(--mulberry)] py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-12">
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6 w-full max-w-xl">
          <h2 className="text-3xl font-bold text-[#690375] text-center font-poppins">
            Date de Contact
          </h2>

          <div className="space-y-4 text-lg">
            <div className="flex items-center space-x-4">
              <span className="text-[var(--purple)] font-semibold">
                Adresă:
              </span>
              <p>Splaiul Independenței 313, București, România</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[var(--purple)] font-semibold">
                Telefon:
              </span>
              <p>+40 123 216 719</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[var(--purple)] font-semibold">Email:</span>
              <p>contact@visioscience.com</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[var(--purple)] font-semibold">
                Website:
              </span>
              <p>www.visioscience.com</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <Canvas
            camera={{ fov: 50, near: 0.1, far: 1000, position: [0, 0, 6] }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[1, 2, 1]} intensity={3} />
            <ContactBaloon position={[0, -1.9, 1.4]} scale={[1, 1, 1]} />
          </Canvas>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md space-y-6 w-full max-w-xl">
          <h2 className="text-3xl font-bold text-[#690375] text-center font-poppins">
            Formular de Contact
          </h2>

          <form className="space-y-6">
            <div className="flex flex-col">
              <label
                className="text-lg font-medium text-[#690375]"
                htmlFor="name"
              >
                Numele tău
              </label>
              <input
                type="text"
                id="name"
                placeholder="Introdu numele tău"
                className="input-field"
              />
            </div>

            <div className="flex flex-col">
              <label
                className="text-lg font-medium text-[#690375]"
                htmlFor="email"
              >
                Email-ul tău
              </label>
              <input
                type="email"
                id="email"
                placeholder="Introdu email-ul tău"
                className="input-field"
              />
            </div>

            <div className="flex flex-col">
              <label
                className="text-lg font-medium text-[#690375]"
                htmlFor="message"
              >
                Mesajul tău
              </label>
              <textarea
                id="message"
                placeholder="Scrie mesajul tău aici"
                className="input-field h-32 resize-none"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Trimite
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
