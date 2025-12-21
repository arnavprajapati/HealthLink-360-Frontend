import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './app/store';
import { HealthProvider } from './context/HealthContext';
import { GoalsProvider } from './context/GoalsContext';
import useAuthListener from "./hooks/useAuthListener";
import { useSelector } from "react-redux";

const isDoctorProfileComplete = (user) => {
  if (!user || user.role !== 'doctor') return true;
  const profile = user.doctorProfile;
  return profile && profile.speciality && profile.clinicName && profile.experience && profile.qualification;
};

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import PatientDetailsPage from "./pages/doctor/PatientDetailPage/PatientDetailsPage";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import PrivateRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import HomePage from "./pages/common/HomePage";
import Layout from "./components/Layout";
import TrackProgress from "./pages/patient/TrackProgress";
import CalendarPage from "./pages/patient/CalendarPage";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientNotesPage from "./pages/patient/PatientNotesPage";

function App() {
  useAuthListener();
  const { user, isAuthChecking } = useSelector((state) => state.auth);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f3bd]/20 via-white to-[#00a896]/10">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#00a896]/20"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#00a896] animate-spin"></div>
          </div>
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
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
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
          path="/doctor-profile"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <Layout>
                <DoctorProfile />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor-patients"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <Layout>
                <DoctorPatients />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor/patient/:patientId"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
              <Layout>
                <PatientDetailsPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              user.role === 'doctor' ? (
                isDoctorProfileComplete(user) ? (
                  <Navigate to="/doctor-dashboard" replace />
                ) : (
                  <Navigate to="/doctor-profile" replace />
                )
              ) : (
                <Navigate to="/patient-dashboard" replace />
              )
            ) : (
              <HomePage />
            )
          }
        />

        <Route
          path="/patient-track-progress"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <GoalsProvider>
                  <TrackProgress />
                </GoalsProvider>
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <CalendarPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient-appointments"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <PatientAppointments />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient-notes"
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <Layout>
                <PatientNotesPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;