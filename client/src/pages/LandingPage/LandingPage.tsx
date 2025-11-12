import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import AuthModal from '../../components/AuthModal/AuthModal';
import Dashboard from '../../components/Dashboard/Dashboard';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  const [modalType, setModalType] = useState<'login' | 'register' | null>(null);
  const { isAuthenticated } = useAuth();

  const handleOpenLogin = () => setModalType('login');
  const handleOpenRegister = () => setModalType('register');
  const handleCloseModal = () => setModalType(null);
  const handleSwitchToRegister = () => setModalType('register');
  const handleSwitchToLogin = () => setModalType('login');

  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.contentWrapper}>
        <Header onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
        {isAuthenticated ? <Dashboard /> : <Hero />}
      </div>
      {modalType && (
        <AuthModal
          variant={modalType}
          onClose={handleCloseModal}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

export default LandingPage;