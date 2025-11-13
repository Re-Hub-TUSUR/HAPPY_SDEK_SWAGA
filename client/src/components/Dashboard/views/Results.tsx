import React, { useEffect, useState, useCallback } from 'react';
import EmptyState from '../../EmptyState/EmptyState';
import { testApi } from '../../../services/testService'; // Предполагаем, что сервис для результатов будет здесь
import { useToast } from '../../../contexts/ToastContext';
import styles from './Results.module.css';
import { FiFileText } from 'react-icons/fi';

// TODO: Создать сервис для получения результатов
// import { resultApi } from '../../../services/resultService';

const Results: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      // const data = await resultApi.getAllResults();
      // setResults(data);
      // Пока что используем пустой массив для демонстрации Empty State
      setResults([]);
    } catch (error) {
      addToast("Не удалось загрузить результаты", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (isLoading) {
    return <div>Загрузка результатов...</div>;
  }

  return (
    <div className={styles.container}>
      {results.length === 0 ? (
        <EmptyState 
          Icon={FiFileText}
          title="Вы еще не прошли ни одного теста"
          message="Результаты ваших тестов и персональные рекомендации будут отображаться здесь. Самое время начать!"
        />
      ) : (
        <div>
          <h2>Таблица с результатами</h2>
          {/* Здесь будет реализация таблицы */}
        </div>
      )}
    </div>
  );
};

export default Results;