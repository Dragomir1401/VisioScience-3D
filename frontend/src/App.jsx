import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Acasa, Despre, Contact, Math, Physics } from "./pages";
import Login from "./pages/Login";
import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    <main className="white">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Acasa />
              </PrivateRoute>
            }
          />
          <Route
            path="/despre"
            element={
              <PrivateRoute>
                <Despre />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/math"
            element={
              <PrivateRoute>
                <Math />
              </PrivateRoute>
            }
          />
          <Route
            path="/physics"
            element={
              <PrivateRoute>
                <Physics />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
