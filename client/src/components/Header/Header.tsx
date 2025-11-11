import React from 'react';
import cdekLogo from '../../assets/CDEK_logo.png';
import Button from '../Button/Button';
import styles from './Header.module.css';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      <nav className={styles.navigation}>
        <Button variant="primary" Icon={FiLogIn as any}>
          Войти
        </Button>
        <Button variant="secondary" Icon={FiUserPlus as any}>
          Зарегистрироваться
        </Button>
      </nav>
    </header>
  );
};

export default Header;