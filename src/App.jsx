import React, { useState } from "react";
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
import Layout from "./components/Layout";

function App() {
  useAuthListener();
  const { user, isAuthChecking } = useSelector((state) => state.auth);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-[#00a896]">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="text-gray-700 font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  const PatientDashboardWrapper = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    
    return (
      <Layout onAddRecord={() => setShowAddModal(true)}>
        <PatientDashboard 
          showAddModal={showAddModal} 
          setShowAddModal={setShowAddModal}
        />
      </Layout>
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <PatientDashboardWrapper />
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <Layout>
                <DoctorDashboard />
              </Layout>
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