import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import { FiX } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  variant: 'login' | 'register';
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ variant, onClose, onSwitchToRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { login } = useAuth();

  const isRegister = variant === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      addToast("Пароли не совпадают!", 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const response = await authApi.register({ name, email, password });
        addToast(response.message, 'success');
        onSwitchToLogin();
      } else {
        const response = await authApi.login({ email, password });
        login(response.access_token, response.refresh_token);
        addToast('Вход выполнен успешно!', 'success');
        onClose();
      }
    } catch (error: any) {
      addToast(error.message || 'Произошла неизвестная ошибка', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          {FiX({size: 24})}
        </button>
        
        <div className={styles.modalHeader}>
          <h2>{isRegister ? 'Добро пожаловать в CDEK!' : 'Рады видеть вас снова!'}</h2>
          <p>
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            <span onClick={isRegister ? onSwitchToLogin : onSwitchToRegister}>
              {isRegister ? ' Войти' : ' Зарегистрироваться'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isRegister && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Имя*</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Пожалуйста, введите ваше имя" required disabled={isLoading} />
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Почта*</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Введите вашу почту" required disabled={isLoading} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль*</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите ваш пароль" required disabled={isLoading} />
          </div>
          {isRegister && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Подтвердите пароль*</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите ваш пароль" required disabled={isLoading} />
            </div>
          )}
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;