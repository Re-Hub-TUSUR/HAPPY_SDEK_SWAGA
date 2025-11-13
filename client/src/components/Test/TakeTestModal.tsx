import React, { useEffect, useState } from 'react';
import styles from './TakeTestModal.module.css';
import { useToast } from '../../contexts/ToastContext';
import { testApi } from '../../services/testService';
import Loader from '../Loader/Loader';
import { FiX } from 'react-icons/fi';

interface Question {
  id: number;
  text: string;
}

interface TestDetails {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

interface TakeTestModalProps {
  testId: number;
  onClose: () => void;
}

const TakeTestModal: React.FC<TakeTestModalProps> = ({ testId, onClose }) => {
  const [test, setTest] = useState<TestDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchTest = async () => {
      setIsLoading(true);
      try {
        const data = await testApi.getTestById(testId);
        setTest(data);
      } catch (error) {
        addToast('Не удалось загрузить тест', 'error');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId, addToast, onClose]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await testApi.submitTest(testId, answers);
      addToast('Тест успешно пройден!', 'success');
      onClose();
    } catch (error) {
      addToast('Ошибка при отправке теста', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {isLoading || !test ? <Loader /> : (
          <>
            <div className={styles.header}>
              <h2>{test.title}</h2>
              <button onClick={onClose}>{FiX({})}</button>
            </div>
            <div className={styles.content}>
              <p className={styles.description}>{test.description}</p>
              {test.questions.map((q) => (
                <div key={q.id} className={styles.questionBlock}>
                  <p className={styles.questionText}>{q.text}</p>
                  <div className={styles.options}>
                    {['1', '2', '3', '4', '5'].map(val => (
                      <label key={val}>
                        <input type="radio" name={`q-${q.id}`} value={val} onChange={() => handleAnswerChange(q.id, val)} />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <button onClick={handleSubmit} className={styles.submitBtn}>Завершить тест</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TakeTestModal;