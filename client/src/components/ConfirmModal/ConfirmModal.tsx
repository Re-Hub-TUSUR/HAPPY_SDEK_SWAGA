import React from 'react';
import styles from './ConfirmModal.module.css';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Отмена' }) => {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          {FiAlertTriangle({ size: 28, color: '#D97706' })}
        </div>
        <div className={styles.content}>
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onCancel} className={`${styles.btn} ${styles.btnCancel}`}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`${styles.btn} ${styles.btnConfirm}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;