import React from 'react';
import styles from './CompletionModal.module.css';
import { FiCheck } from 'react-icons/fi';

interface CompletionModalProps {
  nextDateMessage: string | null;
  onClose: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ nextDateMessage, onClose }) => {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.iconWrapper}>
          {FiCheck({ size: 32 })}
        </div>
        <h3>Тест пройден!</h3>
        <p>
          Спасибо за участие! Ваши результаты и персональные рекомендации уже ждут вас на странице "Результаты".
          {nextDateMessage && <><br/>{nextDateMessage}</>}
        </p>
        <button onClick={onClose} className={styles.actionButton}>
          Вернуться к тестам
        </button>
      </div>
    </div>
  );
};

export default CompletionModal;