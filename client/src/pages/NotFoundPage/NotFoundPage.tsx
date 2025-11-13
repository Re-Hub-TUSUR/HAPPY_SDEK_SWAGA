import React from 'react';
import { Link } from 'react-router-dom';
import mascot from '../../assets/Maskot.png';
import Button from '../../components/Button/Button';
import styles from './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src={mascot} alt="Маскот СДЭК" className={styles.mascotImage} />
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>
        Кажется, вы заблудились или зашли по неверной ссылке.
        <br />
        Давайте вернем вас на правильный путь!
      </p>
      <Link to="/" className={styles.homeLink}>
        <Button variant="cta">На главную</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;