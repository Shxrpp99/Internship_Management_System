import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import SupervisorDashboard from './pages/SupervisorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import InternshipListPage from './pages/InternshipListPage.jsx';
import InternshipDetailsPage from './pages/InternshipDetailsPage.jsx';
import ApplicationFormPage from './pages/ApplicationFormPage.jsx';
import MyApplicationsPage from './pages/MyApplicationsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import EvaluationPage from './pages/EvaluationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const ROLE_HOME = {
  STUDENT: '/student',
  COMPANY: '/company',
  SUPERVISOR: '/supervisor',
  ADMIN: '/admin',
};

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dest = ROLE_HOME[user.role] || '/login';
  return <Navigate to={dest} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes Inside Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomeRedirect />} />

        {/* Role Specific Home Dashboards */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute roles={['COMPANY']}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute roles={['SUPERVISOR']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* General Application Routes */}
        <Route path="/internships" element={<InternshipListPage />} />
        <Route path="/internships/:id" element={<InternshipDetailsPage />} />
        <Route
          path="/internships/:id/apply"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <ApplicationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['STUDENT', 'SUPERVISOR', 'COMPANY', 'ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route path="/evaluations" element={<EvaluationPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
