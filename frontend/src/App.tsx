import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import FindTutor from "./pages/FindTutor";
import Matches from "./pages/Matches";
import Sessions from "./pages/Sessions";
import Messages from "./pages/Messages";
import StudyPlans from "./pages/StudyPlans";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<DashboardLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/tutors"
            element={<FindTutor />}
          />

          <Route
            path="/matches"
            element={<Matches />}
          />

          <Route
            path="/sessions"
            element={<Sessions />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />

          <Route
            path="/study-plans"
            element={<StudyPlans />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}