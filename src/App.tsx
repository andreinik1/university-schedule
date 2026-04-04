import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { SchedulePage } from './pages/SchedulePage';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { DeanPage } from './pages/DeanPage';
import { AttendancePage } from './pages/AttendancePage';

// Компонент для захисту роутів
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useAuth();

  // Якщо юзера немає — на логін. 
  // ВАЖЛИВО: "/" тут працює коректно завдяки basename в BrowserRouter
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role!)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/university-schedule">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={['guest', 'monitor', 'dean']}>
              <SchedulePage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['monitor']}>
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

          {/* Редірект на головну, якщо шлях не знайдено */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;