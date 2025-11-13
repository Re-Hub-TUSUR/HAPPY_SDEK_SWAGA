import React, { useState } from 'react';
import styles from './ChangePasswordModal.module.css';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../services/authService';
import { FiX } from 'react-icons/fi';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      addToast('Новые пароли не совпадают', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Новый пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      addToast(response.message, 'success');
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка при смене пароля', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Смена пароля</h2>
          <button onClick={onClose}>{FiX({})}</button>
        </div>
        <div className={styles.content}>
          <input 
            type="password" 
            placeholder="Текущий пароль" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Новый пароль" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Повторите новый пароль" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </div>
        <div className={styles.footer}>
          <button onClick={handleSubmit} className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;