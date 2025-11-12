import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import { FiX } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

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
  const { addToast } = useToast();

  const isRegister = variant === 'register';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      addToast("Пароли не совпадают!", 'error');
      return;
    }
    
    // TODO: Здесь будет логика отправки данных на сервер
    console.log({ name, email, password });
    
    if (isRegister) {
      addToast('Вы успешно зарегистрировались!', 'success');
    } else {
      addToast('Вход выполнен успешно!', 'success');
    }
    
    onClose();
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
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Пожалуйста, введите ваше имя"
                required
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Почта*</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите вашу почту"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль*</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          {isRegister && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Подтвердите пароль*</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите ваш пароль"
                required
              />
            </div>
          )}
          
          <button type="submit" className={styles.submitButton}>
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;