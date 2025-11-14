import React from 'react';
import styles from './TextInput.module.css';
import { Question } from '../../types';

interface TextInputProps {
  question: Question;
  currentAnswer: any;
  onAnswer: (questionId: number, answer: any) => void;
}

const TextInput: React.FC<TextInputProps> = ({ question, currentAnswer, onAnswer }) => {
  return (
    <div className={styles.textContainer}>
      <textarea
        className={styles.textarea}
        value={currentAnswer || ''}
        onChange={(e) => onAnswer(question.id!, e.target.value)}
        placeholder="Начните вводить ответ здесь..."
      />
    </div>
  );
};

export default TextInput;