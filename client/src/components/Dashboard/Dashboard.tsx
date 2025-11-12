import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <h1>Главная страница приложения</h1>
      <p>Здесь будет отображаться контент в зависимости от выбранной вкладки в шапке.</p>
    </div>
  );
};

export default Dashboard;