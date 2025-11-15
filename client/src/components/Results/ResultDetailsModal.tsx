import React from 'react';
import styles from './ResultDetailsModal.module.css';
import { TestResult } from '../../types';
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ResultDetailsModalProps {
  result: TestResult;
  onClose: () => void;
}

const ResultDetailsModal: React.FC<ResultDetailsModalProps> = ({ result, onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{result.test_title}</h2>
          <button onClick={onClose}>{FiX({})}</button>
        </div>
        <div className={styles.content}>
          <p>Дата прохождения: {format(new Date(result.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}</p>
          <h4>Рекомендации от AI-ассистента:</h4>
          <p className={styles.recommendationText}>
            {result.recommendations}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsModal;