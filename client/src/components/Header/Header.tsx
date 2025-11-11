import React from 'react';
import cdekLogo from '../../assets/CDEK_logo.png';
import Button from '../Button/Button';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      <nav className={styles.navigation}>
        <Button variant="primary">Войти</Button>
        <Button variant="secondary">Зарегистрироваться</Button>
      </nav>
    </header>
  );
};

export default Header;