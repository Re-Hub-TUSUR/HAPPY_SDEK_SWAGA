import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export type ToastType = 'success' | 'error';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.iconContainer}>
         {Icon && Icon({ size: 24 })}
      </div>
      <p className={styles.message}>{message}</p>
      <button onClick={() => onClose(id)} className={styles.closeButton}>
        {FiX({ size: 20 })}
      </button>
    </div>
  );
};

export default Toast;