import React from 'react';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingPageContainer}>
      <div className={styles.contentWrapper}>
        <Header />
        <Hero />
      </div>
    </div>
  );
};

export default LandingPage;