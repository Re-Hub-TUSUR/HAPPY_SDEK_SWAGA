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

const INTERPRETATION_KEY_MAP: { [key: string]: string } = {
  personal_level: 'Личностное',
  work_level: 'Рабочее',
  client_level: 'Клиентское',
  overall_level: 'Общий уровень',
  exhaustion_level: 'Истощение',
  disengagement_level: 'Отстраненность',
};

const ResultDetailsModal: React.FC<ResultDetailsModalProps> = ({ result, onClose }) => {
  const interpretationItems = result.interpretation 
    ? Object.entries(result.interpretation).filter(([key]) => key !== 'note') 
    : [];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{result.test_title}</h2>
          <button onClick={onClose}>{FiX({})}</button>
        </div>
        <div className={styles.content}>
          <p className={styles.date}>Дата прохождения: {format(new Date(result.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}</p>
          
          {interpretationItems.length > 0 && (
            <div className={styles.interpretationSection}>
              <h4>Краткая интерпретация:</h4>
              <div className={styles.interpretationGrid}>
                {interpretationItems.map(([key, value]) => (
                  <div key={key} className={styles.interpretationItem}>
                    <span className={styles.interpKey}>{INTERPRETATION_KEY_MAP[key] || key}</span>
                    <span className={`${styles.interpValue} ${styles[String(value).toLowerCase()]}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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