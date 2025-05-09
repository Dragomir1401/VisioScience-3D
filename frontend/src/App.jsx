import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";

// public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// protected pages
import Acasa from "./pages/Acasa";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Math from "./pages/Math";
import Physics from "./pages/Physics";
import Chemistry from "./pages/Chemistry";
import ComputerScience from "./pages/ComputerScience";
import Astronomy from "./pages/Astronomy";
import RedirectPage from "./pages/Shop";
import ClassDetails from "./components/teacher/ClassDetails";
import QuizCreation from "./components/quiz/QuizCreation";
import QuizDetails from "./components/quiz/QuizDetails";
import QuizAttempt from "./components/quiz/QuizAttempt";
import QuizMeta from "./components/quiz/QuizMeta";
import QuizResults from "./components/quiz/QuizResults";

import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All other routes require auth */}
        <Route element={<PrivateRoute />}>
          {/* index === path="/" */}
          <Route index element={<Acasa />} />

          <Route path="profile" element={<Profile />} />
          <Route path="shop" element={<RedirectPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />

          <Route path="classes/:id" element={<ClassDetails />} />
          <Route path="classes/:id/quiz/create" element={<QuizCreation />} />
          <Route path="quiz/:quizId" element={<QuizDetails />} />
          <Route path="quiz/attempt/:quizId" element={<QuizAttempt />} />
          <Route path="quiz/meta/:quizId" element={<QuizMeta />} />
          <Route
            path="classes/:classId/quiz/:quizId/results"
            element={<QuizResults />}
          />

          <Route path="math" element={<Math />} />
          <Route path="physics" element={<Physics />} />
          <Route path="chemistry" element={<Chemistry />} />
          <Route path="computer-science" element={<ComputerScience />} />
          <Route path="astronomy" element={<Astronomy />} />
        </Route>

        {/* Catch‐all → back to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
