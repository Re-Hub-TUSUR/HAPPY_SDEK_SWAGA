import React from 'react';
import Header from '../../components/Header/Header';
import Dashboard from '../../components/Dashboard/Dashboard';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;