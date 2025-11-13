import React from 'react';
import Header from '../../components/Header/Header';
import Profile from '../../components/Profile/Profile';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
  return (
    <div className={`${styles.pageContainer} pageWithGradients`}>
      <Header
        onLoginClick={() => {}} 
        onRegisterClick={() => {}} 
      />
      <main className={styles.contentWrapper}>
        <Profile />
      </main>
    </div>
  );
};

export default ProfilePage;