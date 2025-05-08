import React from "react";

const RedirectPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--melon)] via-[var(--rosy-brown)] to-[var(--mulberry)]">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-[#690375] mb-6">
          Redirecționare către magazinul nostru
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Vizitează magazinul nostru online pentru a explora culegeri si
          materiale educaționale pentru materiile științifice. Avem o gamă
          variată de produse care te vor ajuta să înveți și să te dezvolți.
        </p>
        <p className="text-lg text-gray-700 mb-8">
          Dă click pe butonul de mai jos pentru a accesa magazinul!
        </p>

        <button
          className="btn-primary"
          onClick={() =>
            (window.location.href = "https://6eqrym-pf.myshopify.com/")
          }
        >
          Mergi acum la magazin
        </button>
      </div>
    </div>
  );
};

export default RedirectPage;
