import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AuthModal from './components/AuthModal/AuthModal';
import { useAuth } from './contexts/AuthContext';
import Loader from './components/Loader/Loader';

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [modalType, setModalType] = useState<'login' | 'register' | null>(null);

  const handleOpenLogin = () => setModalType('login');
  const handleOpenRegister = () => setModalType('register');
  const handleCloseModal = () => setModalType(null);
  const handleSwitchToRegister = () => setModalType('register');
  const handleSwitchToLogin = () => setModalType('login');

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <LandingPage onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
      {modalType && (
        <AuthModal
          variant={modalType}
          onClose={handleCloseModal}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} /> 
    </Routes>
  );
}

export default App;