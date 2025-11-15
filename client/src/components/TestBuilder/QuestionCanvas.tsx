import React from 'react';
import { FiPlus, FiInfo } from 'react-icons/fi';
import styles from './QuestionCanvas.module.css';
import QuestionEditorCard from './QuestionEditorCard';
import { Question } from '../../types';

interface QuestionCanvasProps {
  questions: Question[];
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
  onDeleteQuestion: (index: number) => void;
  isStandardTest: boolean;
}

const QuestionCanvas: React.FC<QuestionCanvasProps> = ({
  questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion, isStandardTest
}) => {
  return (
    <div className={styles.canvasContainer}>
      {questions.length === 0 && (
        isStandardTest ? (
          <div className={styles.standardTestInfo}>
            {FiInfo({ size: 28, color: '#6b7280' })}
            <div>
              <h4>Это стандартный тест</h4>
              <p>Вопросы и логика для этого теста определены методологией и не могут быть изменены. Они будут автоматически добавлены при сохранении.</p>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Начните с добавления вашего первого вопроса.</p>
          </div>
        )
      )}

      {questions.map((q, index) => (
        <QuestionEditorCard
          key={q.temp_id}
          index={index}
          question={q}
          onUpdate={onUpdateQuestion}
          onDelete={onDeleteQuestion}
          isStandardTest={isStandardTest}
        />
      ))}
      
      {!isStandardTest && (
        <button onClick={onAddQuestion} className={styles.addBtn}>
          {FiPlus({})} Добавить вопрос
        </button>
      )}
    </div>
  );
};

export default QuestionCanvas;