import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Tests from '../../components/Dashboard/views/Tests';
import Results from '../../components/Dashboard/views/Results';
import Mood from '../../components/Dashboard/views/Mood';
import styles from './DashboardPage.module.css';
import { NAVIGATION_TABS, DEFAULT_TAB, type NavigationTab } from '../../constants/navigation';

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get('tab');
  const activeTab: NavigationTab = NAVIGATION_TABS.includes(currentTab as NavigationTab) 
    ? (currentTab as NavigationTab) 
    : DEFAULT_TAB;

  const renderContent = () => {
    switch (activeTab) {
      case 'Тесты':
        return <Tests />;
      case 'Результаты':
        return <Results />;
      case 'Для настроения':
        return <Mood />;
      default:
        return <Results />;
    }
  };

  return (
    <div className={`${styles.pageContainer} pageWithGradients`}>
      <Header 
        activeTab={activeTab} 
        onLoginClick={() => {}} 
        onRegisterClick={() => {}} 
      />
      <main className={styles.contentWrapper}>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;