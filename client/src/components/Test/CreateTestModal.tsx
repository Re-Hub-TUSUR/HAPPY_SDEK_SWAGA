import React, { useState } from 'react';
import styles from './CreateTestModal.module.css';
import { useToast } from '../../contexts/ToastContext';
import { testApi } from '../../services/testService';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

interface CreateTestModalProps {
  onClose: () => void;
  onTestCreated: () => void;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ onClose, onTestCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('small');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleAddQuestion = () => setQuestions([...questions, '']);
  
  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('questions', JSON.stringify(questions));
    if (image) {
      formData.append('image', image);
    }
    
    setIsLoading(true);
    try {
      await testApi.createTest(formData);
      addToast('Тест успешно создан!', 'success');
      onTestCreated();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка при создании теста', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Создание нового теста</h2>
          <button onClick={onClose}>{FiX({})}</button>
        </div>
        <div className={styles.content}>
          <input type="text" placeholder="Название теста" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Описание теста" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="small">Ежедневный тест</option>
            <option value="CBI">Тест CBI (19 вопросов)</option>
            <option value="OLBI">Тест OLBI (16 вопросов)</option>
          </select>
          <div className={styles.fileInput}>
            <label htmlFor="image-upload">Изображение для теста (необязательно)</label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <hr />
          <h4>Вопросы</h4>
          {questions.map((q, index) => (
            <div key={index} className={styles.questionRow}>
              <textarea placeholder={`Вопрос №${index + 1}`} value={q} onChange={(e) => handleQuestionChange(index, e.target.value)} />
              <button onClick={() => handleRemoveQuestion(index)} className={styles.deleteBtn}>{FiTrash2({})}</button>
            </div>
          ))}
          <button onClick={handleAddQuestion} className={styles.addBtn}>{FiPlus({})} Добавить вопрос</button>
        </div>
        <div className={styles.footer}>
          <button onClick={handleSubmit} className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить тест'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestModal;