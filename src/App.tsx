import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { SchedulePage } from './pages/SchedulePage';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { DeanPage } from './pages/DeanPage';
import { AttendancePage } from './pages/AttendancePage';

// 1. Оголошуємо ProtectedRoute ПОЗА межами інших компонентів
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Поки йде перевірка сесії в Supabase, показуємо завантаження
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

// 2. Основні маршрути
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Якщо юзер залогінений, не пускаємо його на сторінку логіну */}
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

// 3. Головний вхід
function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/university-schedule/">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;