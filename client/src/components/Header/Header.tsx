import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cdekLogo from '../../assets/CDEK_logo.png';
import styles from './Header.module.css';
import { FiLogIn, FiUserPlus, FiMenu, FiX, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';
import { NAVIGATION_TABS, type NavigationTab } from '../../constants/navigation';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  activeTab?: NavigationTab;
  isTransparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, activeTab, isTransparent }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const avatarUrl = `${process.env.REACT_APP_SERVER_URL}/static/uploads/${user?.avatar_url || 'default_avatar.png'}`;
  const headerClasses = `${styles.header} ${isTransparent ? styles.transparent : ''}`;

  return (
    <header className={headerClasses}>
      <Link to={isAuthenticated ? "/dashboard" : "/"}>
        <img src={cdekLogo} alt="Логотип СДЭК" className={styles.logo} />
      </Link>
      
      {isLoading ? null : isAuthenticated ? (
        <>
          <div className={styles.desktopNav}>
            <div className={styles.navTabs}>
              {NAVIGATION_TABS.map((link) => (
                <Link
                  key={link}
                  to={`/dashboard?tab=${link}`}
                  className={`${styles.navLink} ${location.pathname === '/dashboard' && activeTab === link ? styles.active : ''}`}
                >
                  {link}
                </Link>
              ))}
            </div>
              <div className={styles.userInfo}>
                <div className={styles.pointsBadge}>
                  {FiStar({})}
                  <span>{user?.points ?? 0}</span>
                </div>
                <Link to="/profile" className={styles.profileLink}>
                  <img src={avatarUrl} alt="Аватар" className={styles.headerAvatar} />
                  <span className={styles.userName}>{user?.first_name || 'Профиль'}</span>
                </Link>
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
                    <Link to="/profile" className={styles.profileLink} onClick={() => setIsMobileMenuOpen(false)}>
                      <img src={avatarUrl} alt="Аватар" className={styles.headerAvatar} />
                      <span className={styles.userName}>{user?.first_name || 'Профиль'}</span>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                      {FiX({ size: 28, color: '#374151' })}
                    </button>
                  </div>
                  <div className={styles.mobileMenuLinks}>
                    {NAVIGATION_TABS.map((link) => (
                      <Link
                        key={link}
                        to={`/dashboard?tab=${link}`}
                        className={`${styles.mobileNavLink} ${activeTab === link ? styles.active : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link}
                      </Link>
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