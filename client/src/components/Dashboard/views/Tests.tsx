import React, { useEffect, useState, useCallback } from 'react';
import TestCard from '../../Test/TestCard';
import CreateTestModal from '../../Test/CreateTestModal';
import EditTestModal from '../../Test/EditTestModal';
import TakeTestModal from '../../Test/TakeTestModal';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import { useAuth } from '../../../contexts/AuthContext';
import { testApi } from '../../../services/testService';
import { useToast } from '../../../contexts/ToastContext';
import styles from './Tests.module.css';
import { FiPlus } from 'react-icons/fi';

interface Test {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
}

const Tests: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTestId, setViewingTestId] = useState<number | null>(null);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
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
    return <div>Загрузка тестов...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {tests.map(test => (
          <TestCard 
            key={test.id}
            title={test.title}
            description={test.description}
            imageUrl={test.image_url}
            isPsychologist={isPsychologist}
            onTakeTest={() => setViewingTestId(test.id)}
            onEdit={() => setEditingTestId(test.id)}
            onDelete={() => setDeletingTest(test)}
          />
        ))}
      </div>

      {isPsychologist && (
        <button className={styles.fab} onClick={() => setIsCreateModalOpen(true)}>
          {FiPlus({ size: 28 })}
        </button>
      )}
      
      {deletingTest && (
        <ConfirmModal 
          title="Подтвердите удаление"
          message={`Вы уверены, что хотите удалить тест "${deletingTest.title}"? Это действие необратимо.`}
          onConfirm={handleDeleteTest}
          onCancel={() => setDeletingTest(null)}
          confirmText="Удалить"
        />
      )}

      {isCreateModalOpen && ( <CreateTestModal onClose={() => setIsCreateModalOpen(false)} onTestCreated={fetchTests} /> )}
      {editingTestId && ( <EditTestModal testId={editingTestId} onClose={() => setEditingTestId(null)} onTestUpdated={fetchTests} /> )}
      {viewingTestId && ( <TakeTestModal testId={viewingTestId} onClose={() => setViewingTestId(null)} /> )}
    </div>
  );
};

export default Tests;