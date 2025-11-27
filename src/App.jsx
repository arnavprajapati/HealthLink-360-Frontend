import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useAuthListener from "./hooks/useAuthListener";
import { useSelector } from "react-redux";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PrivateRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import HomePage from "./pages/common/HomePage"; 

function App() {
  useAuthListener();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              user.role === 'doctor' ? (
                <Navigate to="/doctor-dashboard" replace />
              ) : (
                <Navigate to="/patient-dashboard" replace />
              )
            ) : (
              <HomePage />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;