import React from 'react';
import styles from './ChoiceInput.module.css';
import { Question } from '../../types';

interface ChoiceInputProps {
  question: Question;
  currentAnswer: any;
  onAnswer: (questionId: number, answer: any) => void;
}

const ChoiceInput: React.FC<ChoiceInputProps> = ({ question, currentAnswer, onAnswer }) => {
  const options = question.config.options || [];

  return (
    <div className={styles.choiceContainer}>
      {options.map((option, index) => (
        <button
          key={index}
          className={`${styles.optionButton} ${currentAnswer === option ? styles.selected : ''}`}
          onClick={() => onAnswer(question.id!, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ChoiceInput;