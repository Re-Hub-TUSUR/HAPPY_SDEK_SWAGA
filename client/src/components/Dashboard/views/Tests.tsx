import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TestCard from '../../Test/TestCard';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import EmptyState from '../../EmptyState/EmptyState';
import { useAuth } from '../../../contexts/AuthContext';
import { testApi } from '../../../services/testService';
import { useToast } from '../../../contexts/ToastContext';
import styles from './Tests.module.css';
import { FiPlus, FiInbox } from 'react-icons/fi';
import Loader from '../../Loader/Loader';

interface Test {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  next_available_at: string | null;
}

const Tests: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTest, setDeletingTest] = useState<Test | null>(null);

  const isPsychologist = user?.role === 'psychologist';

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await testApi.getAllTests();
      setTests(data);
    } catch (error) {
      addToast("Не удалось загрузить тесты", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDeleteTest = async () => {
    if (!deletingTest) return;

    try {
      await testApi.deleteTest(deletingTest.id);
      addToast('Тест успешно удален', 'success');
      fetchTests();
    } catch (error) {
      addToast('Ошибка при удалении теста', 'error');
    } finally {
      setDeletingTest(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      {tests.length === 0 ? (
        <EmptyState 
          Icon={FiInbox}
          title="Тесты еще не добавлены"
          message="Как только психологи добавят новые тесты для прохождения, они появятся здесь."
        />
      ) : (
        <div className={styles.grid}>
          {tests.map(test => (
            <TestCard 
              key={test.id}
              testId={test.id}
              title={test.title}
              description={test.description}
              imageUrl={test.image_url}
              isPsychologist={isPsychologist}
              onTakeTest={() => navigate(`/test/${test.id}`)}
              onDelete={() => setDeletingTest(test)}
              isCompleted={!!test.next_available_at}
              nextAvailableAt={test.next_available_at}
              category={test.category}
            />
          ))}
        </div>
      )}

      {isPsychologist && (
        <Link to="/tests/new" className={styles.fab}>
          {FiPlus({ size: 28 })}
        </Link>
      )}

      {deletingTest && ( <ConfirmModal title="Подтвердите удаление" message={<>Вы уверены, что хотите удалить тест <br /> <strong>"{deletingTest.title}"</strong>? <br /> Это действие необратимо.</>} onConfirm={handleDeleteTest} onCancel={() => setDeletingTest(null)} confirmText="Удалить" /> )}
    </div>
  );
};

export default Tests;