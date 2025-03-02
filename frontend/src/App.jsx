import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Acasa, Despre, Contact } from "./pages";

function App() {
  return (
    <main className="white">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Acasa />} />
          <Route path="/despre" element={<Despre />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
