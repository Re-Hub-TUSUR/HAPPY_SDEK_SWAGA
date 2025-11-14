import React from 'react';
import styles from './TestSettings.module.css';

interface TestSettingsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  type: string;
  onTypeChange: (newType: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setImage: (file: File | null) => void;
}

const TestSettings: React.FC<TestSettingsProps> = ({
  title, setTitle, description, setDescription, type, onTypeChange,
  isAnonymous, setIsAnonymous, setImage
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h3>Настройки теста</h3>
      
      <div className={styles.inputGroup}>
        <label htmlFor="test-title">Название теста</label>
        <input id="test-title" type="text" placeholder="Введите название..." value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="test-description">Описание</label>
        <textarea id="test-description" placeholder="Введите краткое описание..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="test-type">Тип теста</label>
        <select id="test-type" value={type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="custom">Пользовательский тест</option>
          <option value="CBI">Стандартный тест CBI</option>
          <option value="OLBI">Стандартный тест OLBI</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="image-upload">Обложка теста (необязательно)</label>
        <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <label className={styles.checkboxGroup}>
        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
        <span>Сделать опрос анонимным</span>
      </label>
    </div>
  );
};

export default TestSettings;