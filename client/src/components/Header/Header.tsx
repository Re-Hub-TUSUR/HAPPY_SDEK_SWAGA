import React from 'react';
import cdekLogo from '../../assets/CDEK_logo.png';
import Button from '../Button/Button';
import styles from './Header.module.css';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <header className={styles.header}>
      <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      <nav className={styles.navigation}>
        <Button variant="primary" Icon={FiLogIn as any} onClick={onLoginClick}>
          Войти
        </Button>
        <Button variant="secondary" Icon={FiUserPlus as any} onClick={onRegisterClick}>
          Зарегистрироваться
        </Button>
      </nav>
    </header>
  );
};

export default Header;