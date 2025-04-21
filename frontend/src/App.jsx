import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Acasa, Despre, Contact, Math, Physics, Chemistry } from "./pages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./pages/PrivateRoute";
import Profile from "./pages/Profile";
import ClassDetails from "./components/teacher/ClassDetails";
import QuizCreation from "./components/quiz/QuizCreation";
import QuizDetails from "./components/quiz/QuizDetails";

function App() {
  return (
    <main className="white">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Acasa />
              </PrivateRoute>
            }
          />
          <Route path="/despre" element={<Despre />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/classes/:id" element={<ClassDetails />} />
          <Route path="/classes/:id/quiz/create" element={<QuizCreation />} />
          <Route path="/quiz/:quizId" element={<QuizDetails />} />
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
          <Route
            path="/chemistry"
            element={
              <PrivateRoute>
                <Chemistry />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
