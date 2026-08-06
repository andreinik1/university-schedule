import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { SchedulePage } from './pages/SchedulePage/SchedulePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { Navbar } from './components/layout/Navbar/Navbar';
import { DeanPage } from './pages/DeanPage/DeanPage';
import { AttendancePage } from './pages/AttendancePage/AttendancePage';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { ScheduleEditorPage } from './pages/ScheduleEditorPage/ScheduleEditorPage';
import { Footer } from './components/layout/Footer/Footer';
import { NewsPage } from './pages/NewsPage/NewsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Завантаження...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role!)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="appContainer">
      <Navbar />
      <main className="mainContent">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={['guest', 'monitor', 'dean', 'admin', 'scientific_dept']}>
              <SchedulePage />
            </ProtectedRoute>
          } />

          <Route path="/news" element={
            <ProtectedRoute allowedRoles={['monitor', 'admin', 'scientific_dept', 'dean']}>
              <NewsPage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['monitor', 'dean', 'admin']}>
              <AttendancePage />
            </ProtectedRoute>
          } />

          <Route path="/dean-reports" element={
            <ProtectedRoute allowedRoles={['dean', 'admin']}>
              <DeanPage />
            </ProtectedRoute>
          } />

          <Route path="/schedule-editor" element={
            <ProtectedRoute allowedRoles={['admin', 'scientific_dept']}>
              <ScheduleEditorPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;