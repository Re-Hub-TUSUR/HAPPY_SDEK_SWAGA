import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TestBuilderPage.module.css';
import { testApi } from '../../services/testService';
import { useToast } from '../../contexts/ToastContext';
import { Question } from '../../types';
import TestSettings from '../../components/TestBuilder/TestSettings';
import QuestionCanvas from '../../components/TestBuilder/QuestionCanvas';
import Loader from '../../components/Loader/Loader';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { v4 as uuidv4 } from 'uuid';

const TestBuilderPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('custom');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!testId);
  
  const [isDirty, setIsDirty] = useState(false);
  const isInitialMount = useRef(true);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [typeChange, setTypeChange] = useState<{ targetType: string } | null>(null);

  const isStandardTest = type === 'CBI' || type === 'OLBI';

  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        try {
          const data = await testApi.getTestById(parseInt(testId)); 
          setTitle(data.title);
          setDescription(data.description);
          setType(data.type);
          setQuestions(data.questions.map((q: any) => ({
            ...q,
            temp_id: uuidv4()
          })));
        } catch (error) {
          addToast('Не удалось загрузить данные теста', 'error');
          navigate('/dashboard');
        } finally {
          setIsFetching(false);
        }
      };
      fetchTest();
    }
  }, [testId, addToast, navigate]);
  
  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
    } else {
        setIsDirty(true);
    }
  }, [title, description, type, isAnonymous, image, questions]);


  const handleTypeChange = (newType: string) => {
    if (newType !== type && questions.length > 0 && !isStandardTest) {
      setTypeChange({ targetType: newType });
    } else {
      setType(newType);
      if (newType === 'CBI' || newType === 'OLBI') {
        setQuestions([]);
      }
    }
  };

  const confirmTypeChange = () => {
    if (typeChange) {
      setType(typeChange.targetType);
      setQuestions([]);
    }
    setTypeChange(null);
  };
  
  const handleCancel = () => {
    if(isDirty) {
      setShowCancelConfirm(true);
    } else {
      navigate('/dashboard?tab=Тесты');
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    navigate('/dashboard?tab=Тесты');
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      temp_id: uuidv4(),
      text: '',
      question_type: 'scale',
      config: {},
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('is_anonymous', String(isAnonymous));
    if (image) {
      formData.append('image', image);
    }
    
    if(!isStandardTest) {
      const questionsToSubmit = questions.map((q, index) => ({
        text: q.text,
        question_type: q.question_type,
        config: q.config,
        order: index,
      }));
      formData.append('questions', JSON.stringify(questionsToSubmit));
    }
    
    try {
      if (testId) {
        await testApi.updateTest(parseInt(testId), formData);
        addToast('Тест успешно обновлен!', 'success');
      } else {
        await testApi.createTest(formData);
        addToast('Тест успешно создан!', 'success');
      }
      navigate('/dashboard?tab=Тесты');
    } catch (error: any) {
      addToast(error.message || 'Произошла ошибка', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Loader />;
  }

  return (
    <>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>{testId ? 'Редактирование теста' : 'Создание нового теста'}</h1>
          <div className={styles.headerActions}>
            <button onClick={handleCancel} className={styles.cancelBtn}>Отмена</button>
            <button onClick={handleSubmit} className={styles.saveBtn} disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить тест'}
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          <TestSettings
            title={title} setTitle={setTitle}
            description={description} setDescription={setDescription}
            type={type} onTypeChange={handleTypeChange}
            isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous}
            setImage={setImage}
          />
          <QuestionCanvas
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            isStandardTest={isStandardTest}
          />
        </main>
        
        <div className={styles.footerActions}>
          <button onClick={handleCancel} className={styles.cancelBtn}>Отмена</button>
          <button onClick={handleSubmit} className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {showCancelConfirm && (
        <ConfirmModal 
          title="Выйти без сохранения?"
          message="Все несохраненные изменения будут потеряны. Вы уверены, что хотите выйти?"
          onConfirm={confirmCancel}
          onCancel={() => setShowCancelConfirm(false)}
          confirmText="Да, выйти"
          cancelText="Остаться"
        />
      )}

      {typeChange && (
        <ConfirmModal 
          title="Сменить тип теста?"
          message="Все вопросы, которые вы добавили, будут удалены. Это действие необратимо."
          onConfirm={confirmTypeChange}
          onCancel={() => setTypeChange(null)}
          confirmText="Да, сменить"
          cancelText="Отмена"
        />
      )}
    </>
  );
};

export default TestBuilderPage;