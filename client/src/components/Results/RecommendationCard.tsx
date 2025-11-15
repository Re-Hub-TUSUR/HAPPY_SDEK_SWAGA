import React from 'react';
import styles from './RecommendationCard.module.css';
import Loader from '../Loader/Loader';

interface RecommendationCardProps {
  recommendation: string;
  isLoading: boolean;
  onReadMore: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, isLoading, onReadMore }) => {
  if (isLoading) {
    return <div className={styles.card}><Loader /></div>;
  }

  return (
    <div className={styles.card}>
      <p className={styles.text}>{recommendation}</p>
      <button onClick={onReadMore} className={styles.toggleButton}>
        Читать подробнее
      </button>
    </div>
  );
};

export default RecommendationCard;