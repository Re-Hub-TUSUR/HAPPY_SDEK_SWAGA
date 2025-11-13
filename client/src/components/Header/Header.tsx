import React, { useState } from 'react';
import cdekLogo from '../../assets/CDEK_logo.png';
import styles from './Header.module.css';
import { FiLogIn, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';

type ActiveTab = 'Тесты' | 'Результаты' | 'Для настроения';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  activeTab?: ActiveTab;
  onTabClick?: (tab: ActiveTab) => void;
  isTransparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, activeTab, onTabClick, isTransparent }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    onTabClick?.(tab);
    setIsMobileMenuOpen(false);
  };

  const headerClasses = `${styles.header} ${isTransparent ? styles.transparent : ''}`;

  return (
    <header className={headerClasses}>
      <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      {isLoading ? null : isAuthenticated ? (
        <>
          <div className={styles.desktopNav}>
            <div className={styles.navTabs}>
              {['Тесты', 'Результаты', 'Для настроения'].map((link) => (
                <button
                  key={link}
                  className={`${styles.navLink} ${activeTab === link ? styles.active : ''}`}
                  onClick={() => handleTabClick(link as ActiveTab)}
                >
                  {link}
                </button>
              ))}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Пользователь'}</span>
              <button onClick={logout} className={styles.logoutButton}>Выйти</button>
            </div>
          </div>

          <div className={styles.mobileNav}>
            <button className={styles.hamburgerButton} onClick={() => setIsMobileMenuOpen(true)}>
              {FiMenu({ size: 28, color: '#374151' })}
            </button>
          </div>

          {isMobileMenuOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className={styles.mobileMenu}>
                <div>
                  <div className={styles.mobileMenuHeader}>
                    <span className={styles.userName}>{user?.name || 'Пользователь'}</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                      {FiX({ size: 28, color: '#374151' })}
                    </button>
                  </div>
                  <div className={styles.mobileMenuLinks}>
                    {['Тесты', 'Результаты', 'Для настроения'].map((link) => (
                      <button
                        key={link}
                        className={`${styles.mobileNavLink} ${activeTab === link ? styles.active : ''}`}
                        onClick={() => handleTabClick(link as ActiveTab)}
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={logout} className={styles.mobileLogoutButton}>Выйти</button>
              </div>
            </>
          )}
        </>
      ) : (
        <nav className={styles.navigation}>
          <Button variant="primary" Icon={FiLogIn as any} onClick={onLoginClick}>Войти</Button>
          <Button variant="secondary" Icon={FiUserPlus as any} onClick={onRegisterClick}>Зарегистрироваться</Button>
        </nav>
      )}
    </header>
  );
};

export default Header;