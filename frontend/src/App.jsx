import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import LoginPage from './pages/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={["teacher", "admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
