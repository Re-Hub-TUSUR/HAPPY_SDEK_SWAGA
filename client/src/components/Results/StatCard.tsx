import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  score: number | null;
  maxScore: number;
  description: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ score, maxScore, description, color }) => {
  return (
    <div className={styles.card}>
      <p className={styles.score} style={{ color: color }}> {/* <-- Применяем цвет */}
        {score !== null ? score : '-'}
        <span className={styles.maxScore}>/{maxScore}</span>
      </p>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default StatCard;