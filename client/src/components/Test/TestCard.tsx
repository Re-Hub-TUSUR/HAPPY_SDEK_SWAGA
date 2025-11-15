import React from 'react';
import styles from './TestCard.module.css';
import { FiEye, FiEdit, FiTrash2, FiCheckCircle, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TestCardProps {
  testId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  isPsychologist: boolean;
  onTakeTest: () => void;
  onDelete: () => void;
  isCompleted: boolean;
  category: string;
  nextAvailableAt: string | null;
  points: number;
}

const TestCard: React.FC<TestCardProps> = ({ testId, title, description, imageUrl, isPsychologist, onTakeTest, onDelete, isCompleted, category, nextAvailableAt, points }) => {
  const fullImageUrl = `${process.env.REACT_APP_SERVER_URL}/static/uploads/${imageUrl || 'default_test_image.png'}`;

  const categoryMap: { [key: string]: string } = {
    daily: 'Ежедневный',
    weekly: 'Еженедельный',
    monthly: 'Ежемесячный',
    specialized: 'Специализированный'
  };

  const nextDateMessage = nextAvailableAt 
    ? `Можно пройти с ${format(parseISO(nextAvailableAt), 'dd.MM.yyyy', { locale: ru })}`
    : null;

  return (
    <div className={`${styles.card} ${isCompleted && !isPsychologist ? styles.completed : ''}`}>
      
      {!isPsychologist && !isCompleted && points > 0 && (
        <div className={styles.pointsBadge}>
          {FiStar({ size: 20 })}
          <span>+{points}</span>
        </div>
      )}

      <div className={styles.imageContainer}>
        <img src={fullImageUrl} alt={title} className={styles.image} onError={(e) => {
          (e.target as HTMLImageElement).src = `${process.env.REACT_APP_SERVER_URL}/static/uploads/default_test_image.png`;
        }}/>
      </div>

      {isCompleted && !isPsychologist && (
        <div className={styles.completedOverlay}>
          {FiCheckCircle({ size: 20 })}
          <span>Пройден</span>
        </div>
      )}

      <div className={styles.cardContent}>
        <span className={styles.categoryBadge}>{categoryMap[category] || category}</span>
        
        <h3 className={styles.title} title={title}>
          {title}
        </h3>
        <p className={styles.description} title={description}>
          {description}
        </p>
      </div>
      
      {isPsychologist ? (
        <div className={styles.psychologistActions}>
          <button onClick={onTakeTest}>{FiEye({})} Просмотреть</button>
          <Link to={`/tests/edit/${testId}`} className={styles.actionLink}>
            {FiEdit({})} Редактировать
          </Link>
          <button onClick={onDelete} className={styles.deleteAction}>{FiTrash2({})} Удалить</button>
        </div>
      ) : (
        <div className={styles.ctaWrapper}>
          <button onClick={onTakeTest} className={styles.ctaButton} disabled={isCompleted}>
            {isCompleted ? 'Пройден' : 'Пройти тест'}
          </button>
          {isCompleted && nextDateMessage && (
            <p className={styles.nextDateMessage}>{nextDateMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCard;