import React from 'react';
import styles from './TestCard.module.css';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

interface TestCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  isPsychologist: boolean;
  onTakeTest: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TestCard: React.FC<TestCardProps> = ({ title, description, imageUrl, isPsychologist, onTakeTest, onEdit, onDelete }) => {
  const fullImageUrl = `${process.env.REACT_APP_SERVER_URL}/static/uploads/${imageUrl || 'default_test_image.png'}`;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={fullImageUrl} alt={title} className={styles.image} onError={(e) => {
          (e.target as HTMLImageElement).src = `${process.env.REACT_APP_SERVER_URL}/static/uploads/default_test_image.png`;
        }}/>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      
      {isPsychologist ? (
        <div className={styles.psychologistActions}>
          <button onClick={onTakeTest}>{FiEye({})} Просмотреть</button>
          <button onClick={onEdit}>{FiEdit({})} Редактировать</button>
          <button onClick={onDelete} className={styles.deleteAction}>{FiTrash2({})} Удалить</button>
        </div>
      ) : (
        <button onClick={onTakeTest} className={styles.ctaButton}>
          Пройти тест
        </button>
      )}
    </div>
  );
};

export default TestCard;