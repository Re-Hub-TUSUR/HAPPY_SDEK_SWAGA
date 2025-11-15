import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TestTakingPage.module.css';
import { testApi } from '../../services/testService';
import { useToast } from '../../contexts/ToastContext';
import { Question } from '../../types';
import Loader from '../../components/Loader/Loader';
import ScaleInput from '../../components/TestTaking/ScaleInput';
import ChoiceInput from '../../components/TestTaking/ChoiceInput';
import TextInput from '../../components/TestTaking/TextInput';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import CompletionModal from '../../components/TestTaking/CompletionModal';
import { startOfDay, startOfWeek, startOfMonth, addDays, addWeeks, addMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

interface TestData {
  id: number;
  title: string;
  category: string;
  questions: Question[];
}

const TestTakingPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { updateUser } = useAuth();

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;
    const fetchTest = async () => {
      try {
        const data = await testApi.getTestById(parseInt(testId));
        setTestData(data);
      } catch (error) {
        addToast('Не удалось загрузить тест', 'error');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId, addToast, navigate]);

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (testData && currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer,
      }));

      const response = await testApi.submitTest(parseInt(testId!), answersPayload);
      
      if (response.new_points !== undefined) {
        updateUser({ points: response.new_points });
      }
      
      let nextDate: Date | null = null;
      const now = new Date();
      if (testData?.category === 'daily') {
        nextDate = startOfDay(addDays(now, 1));
      } else if (testData?.category === 'weekly') {
        nextDate = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
      } else if (testData?.category === 'monthly') {
        nextDate = startOfMonth(addMonths(now, 1));
      }
      
      if (nextDate) {
        setCompletionMessage(`Следующий раз этот тест можно будет пройти ${format(nextDate, 'dd MMMM yyyy', { locale: ru })}.`);
      } else {
        setCompletionMessage('');
      }

    } catch (error: any) {
      addToast(error.message || 'Ошибка при отправке теста', 'error');
      setIsSubmitting(false);
    }
  };

  const handleCloseCompletionModal = () => {
    setCompletionMessage(null);
    navigate('/dashboard?tab=Тесты');
  };

  if (isLoading || !testData) {
    return <Loader />;
  }
  
  if (completionMessage !== null) {
    return <CompletionModal nextDateMessage={completionMessage} onClose={handleCloseCompletionModal} />;
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;

  const renderAnswerInput = (question: Question) => {
    switch (question.question_type) {
      case 'scale':
        return <ScaleInput key={question.id} question={question} currentAnswer={answers[question.id!]} onAnswer={handleAnswer} />;
      case 'choice':
        return <ChoiceInput key={question.id} question={question} currentAnswer={answers[question.id!]} onAnswer={handleAnswer} />;
      case 'text':
        return <TextInput key={question.id} question={question} currentAnswer={answers[question.id!]} onAnswer={handleAnswer} />;
      default:
        return <p>Тип вопроса не поддерживается</p>;
    }
  };

  return (
    <>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <button className={styles.exitButton} onClick={() => setShowExitConfirm(true)}>Выйти</button>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${progress}%` }}></div>
          </div>
        </header>

        <div className={styles.testWrapper}>
          <h1 className={styles.questionTitle}>{currentQuestion.text}</h1>
          
          {renderAnswerInput(currentQuestion)}

          <div className={styles.navigation}>
            <button 
              className={styles.navButton} 
              onClick={handleBack} 
              disabled={currentQuestionIndex === 0}
            >
              Назад
            </button>
            
            {isLastQuestion ? (
              <button className={`${styles.navButton} ${styles.cta}`} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Завершить тест'}
              </button>
            ) : (
              <button className={`${styles.navButton} ${styles.cta}`} onClick={handleNext}>
                Следующий вопрос
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showExitConfirm && (
        <ConfirmModal
          title="Вы уверены, что хотите выйти?"
          message="Ваш прогресс не будет сохранен."
          onConfirm={() => navigate('/dashboard?tab=Тесты')}
          onCancel={() => setShowExitConfirm(false)}
          confirmText="Да, выйти"
          cancelText="Остаться"
        />
      )}
    </>
  );
};

export default TestTakingPage;