import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'; // Змінено на HashRouter
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { SchedulePage } from './pages/SchedulePage';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { DeanPage } from './pages/DeanPage';
import { AttendancePage } from './pages/AttendancePage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Завантаження...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role!)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />

        <Route path="/" element={
          <ProtectedRoute allowedRoles={['guest', 'monitor', 'dean']}>
            <SchedulePage />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['monitor', 'dean']}>
            <div style={{ padding: '20px' }}>
              <AttendancePage />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/dean-reports" element={
          <ProtectedRoute allowedRoles={['dean']}>
            <div style={{ padding: '20px' }}>
              <DeanPage />
            </div>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      {/* HashRouter ідеально працює на GitHub Pages без додаткових налаштувань сервера */}
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;