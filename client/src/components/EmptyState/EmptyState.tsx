import React from 'react';
import { IconType } from 'react-icons';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  Icon: IconType;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ Icon, title, message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {Icon({ size: 32 })}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default EmptyState;