import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Tests from '../../components/Dashboard/Tests';
import Results from '../../components/Dashboard/Results';
import Mood from '../../components/Dashboard/Mood';
import styles from './DashboardPage.module.css';

export type ActiveTab = 'Тесты' | 'Результаты' | 'Для настроения';
const TABS: ActiveTab[] = ['Тесты', 'Результаты', 'Для настроения'];

const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab');
  const activeTab: ActiveTab = TABS.includes(currentTab as ActiveTab) ? (currentTab as ActiveTab) : 'Результаты';

  const handleTabClick = (tab: ActiveTab) => {
    setSearchParams({ tab: tab });
  };

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
    <div className={styles.pageContainer}>
      <Header 
        activeTab={activeTab} 
        onTabClick={handleTabClick}
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