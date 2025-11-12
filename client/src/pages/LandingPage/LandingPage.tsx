import React from 'react';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.contentWrapper}>
        <Header onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
        <Hero />
      </div>
    </div>
  );
};

export default LandingPage;