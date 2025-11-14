import React from 'react';
import styles from './ScaleInput.module.css';
import { Question } from '../../types';

interface ScaleInputProps {
  question: Question;
  currentAnswer: any;
  onAnswer: (questionId: number, answer: any) => void;
}

const ScaleInput: React.FC<ScaleInputProps> = ({ question, currentAnswer, onAnswer }) => {
  const options = ['1', '2', '3', '4', '5'];

  return (
    <div className={styles.scaleContainer}>
      {options.map((value) => (
        <label key={value} className={styles.optionLabel}>
          <input
            type="radio"
            name={`question-${question.id}`}
            value={value}
            checked={currentAnswer === value}
            onChange={() => onAnswer(question.id!, value)}
            className={styles.radioInput}
          />
          <span className={styles.radioCircle}>{value}</span>
          {value === '1' && (question.config.min_label || 'Очень плохо')}
          {value === '5' && (question.config.max_label || 'Очень хорошо')}
        </label>
      ))}
    </div>
  );
};

export default ScaleInput;