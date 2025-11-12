import React, { useState } from 'react';
import cdekLogo from '../../assets/CDEK_logo.png';
import styles from './Header.module.css';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [activeLink, setActiveLink] = useState('Результаты');

  const renderGuestHeader = () => (
    <>
      <Button variant="primary" Icon={FiLogIn as any} onClick={onLoginClick}>
        Войти
      </Button>
      <Button variant="secondary" Icon={FiUserPlus as any} onClick={onRegisterClick}>
        Зарегистрироваться
      </Button>
    </>
  );

  const renderUserHeader = () => (
    <div className={styles.userHeader}>
      <div className={styles.navLinks}>
        {['Тесты', 'Результаты', 'Для настроения'].map((link) => (
          <button
            key={link}
            className={`${styles.navLink} ${activeLink === link ? styles.active : ''}`}
            onClick={() => setActiveLink(link)}
          >
            {link}
          </button>
        ))}
      </div>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{user?.name || 'Пользователь'}</span>
        <button onClick={logout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>
    </div>
  );

  return (
    <header className={styles.header}>
      <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      <nav className={styles.navigation}>
        {isLoading ? null : isAuthenticated ? renderUserHeader() : renderGuestHeader()}
      </nav>
    </header>
  );
};

export default Header;