import React from 'react';
import mascot from '../../assets/Maskot.png';
import Button from '../Button/Button';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  return (
    <main className={styles.mainContent}>
      <div className={styles.heroText}>
        <h1>Ваше пространство для комфорта и равновесия</h1>
        <p>
          Здесь вы можете лучше понять своё состояние и найти полезные советы.
          Проверьте свой уровень энергии, получите персональные рекомендации
          и ресурсы для восстановления, которые подходят именно Вам! :)
        </p>
        <Button variant="cta">Хочу попробовать!</Button>
      </div>
      <div className={styles.heroImage}>
        <img src={mascot} alt="Маскот" />
      </div>
    </main>
  );
};

export default Hero;