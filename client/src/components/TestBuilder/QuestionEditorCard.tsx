import React from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import styles from './QuestionEditorCard.module.css';
import { Question } from '../../types';

interface QuestionEditorCardProps {
  index: number;
  question: Question;
  onUpdate: (index: number, updatedQuestion: Question) => void;
  onDelete: (index: number) => void;
  isStandardTest: boolean;
}

const QuestionEditorCard: React.FC<QuestionEditorCardProps> = ({
  index, question, onUpdate, onDelete, isStandardTest
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, { ...question, text: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(index, { ...question, question_type: e.target.value as any });
  };
  
  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...(question.config.options || [])];
    newOptions[optIndex] = value;
    onUpdate(index, { ...question, config: { ...question.config, options: newOptions }});
  }

  const handleAddOption = () => {
    const newOptions = [...(question.config.options || []), `Вариант ${ (question.config.options?.length || 0) + 1 }`];
    onUpdate(index, { ...question, config: { ...question.config, options: newOptions }});
  }

  const handleDeleteOption = (optIndex: number) => {
    const newOptions = (question.config.options || []).filter((_, i) => i !== optIndex);
    onUpdate(index, { ...question, config: { ...question.config, options: newOptions }});
  }

  const renderConfig = () => {
    switch (question.question_type) {
      case 'choice':
        return (
          <div className={styles.configSection}>
            <label>Варианты ответа</label>
            <div className={styles.optionsList}>
              {(question.config.options || []).map((opt, optIndex) => (
                <div key={optIndex} className={styles.optionRow}>
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)} 
                    className={`${styles.input} ${styles.optionInput}`}
                  />
                  <button onClick={() => handleDeleteOption(optIndex)} className={styles.deleteBtn}>
                    {FiTrash2({ size: 18 })}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAddOption} className={styles.addOptionBtn}>{FiPlus({ size: 14 })} Добавить вариант</button>
          </div>
        );
      case 'scale':
        return (
          <div className={styles.configSection}>
            <small>Пользователи будут отвечать по 5-балльной шкале. Настройка шкалы для пользовательских тестов будет доступна в будущем.</small>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <strong>Вопрос {index + 1}</strong>
        {!isStandardTest && (
          <button onClick={() => onDelete(index)} className={styles.deleteBtn}>
            {FiTrash2({})}
          </button>
        )}
      </div>
      <div className={styles.row}>
        <textarea
          value={question.text}
          onChange={handleTextChange}
          placeholder="Введите текст вопроса..."
          className={`${styles.input} ${isStandardTest ? styles.disabled : ''}`}
          rows={3}
          readOnly={isStandardTest}
        />
        {!isStandardTest && (
          <select value={question.question_type} onChange={handleTypeChange} className={styles.select}>
            <option value="scale">Шкала</option>
            <option value="choice">Выбор варианта</option>
            <option value="text">Текстовый ответ</option>
          </select>
        )}
      </div>
      {!isStandardTest && renderConfig()}
    </div>
  );
};

export default QuestionEditorCard;