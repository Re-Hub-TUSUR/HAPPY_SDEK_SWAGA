import React, { useState, useEffect } from 'react';
import styles from './Analytics.module.css';
import { testApi } from '../../../services/testService';
import Loader from '../../Loader/Loader';
import StatCard from '../../Results/StatCard';
import UserDetailView from './UserDetailView';
import { ApiUser, OverviewData } from '../../../types';

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, usersData] = await Promise.all([
          testApi.getAnalyticsOverview(),
          testApi.getAllUsers(),
        ]);
        setOverview(overviewData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (selectedUser) {
    return (
      <div>
        <div className={styles.detailHeader}>
          <h1 className={styles.pageTitle}>Результаты: {selectedUser.name}</h1>
          <button onClick={() => setSelectedUser(null)} className={styles.backButton}>
            Назад к общей статистике
          </button>
        </div>
        <UserDetailView userId={selectedUser.id} userName={selectedUser.name} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Аналитика по сотрудникам</h1>
      {overview && (
        <div className={styles.overviewGrid}>
          <div className={styles.statBlock}>
              <h2 className={styles.sectionTitle}>Общие показатели</h2>
              <div className={styles.statCardGrid}>
                  <StatCard score={overview.total_users} description="Всего сотрудников" color="#3B82F6"/>
                  <StatCard score={overview.total_tests_passed} description="Пройдено тестов" color="#10B981"/>
                  <StatCard score={overview.average_stress_level} maxScore={10} description="Средний уровень стресса" color="#F59E0B"/>
              </div>
          </div>
          <div className={styles.statBlock}>
              <h2 className={styles.sectionTitle}>Распределение</h2>
              <div className={styles.distribution}>
                  <div className={styles.distItem}>
                    <span className={styles.low}>Низкий:</span> 
                    <strong>{overview.level_distribution.low}</strong>
                    <span>чел.</span>
                  </div>
                  <div className={styles.distItem}>
                    <span className={styles.medium}>Умеренный:</span> 
                    <strong>{overview.level_distribution.medium}</strong>
                    <span>чел.</span>
                  </div>
                  <div className={styles.distItem}>
                    <span className={styles.high}>Высокий:</span> 
                    <strong>{overview.level_distribution.high}</strong>
                    <span>чел.</span>
                  </div>
              </div>
          </div>
        </div>
      )}

      <div className={styles.userSelectBlock}>
        <h2 className={styles.sectionTitle}>Просмотр по сотруднику</h2>
        <select
          onChange={handleUserSelect}
          value=""
        >
          <option value="" disabled>Выберите сотрудника...</option>
          {users.map((user: ApiUser) => (
            <option key={user.id} value={String(user.id)}>{user.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Analytics;