import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import styles from './Profile.module.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  const handleSave = async () => {
    if (name === user.name) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({ name });
      updateUser(updatedUser);
      addToast('Имя успешно изменено!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка при сохранении', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setIsEditing(false);
  };

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>Личный кабинет</h2>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Личные данные</h3>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Имя</label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            readOnly={!isEditing} 
            className={isEditing ? styles.editable : ''}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Электронная почта</label>
          <input type="email" id="email" value={user.email} readOnly />
        </div>
        <div className={styles.buttonGroup}>
          {isEditing ? (
            <>
              <button onClick={handleSave} className={`${styles.btn} ${styles.btnSave}`} disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={handleCancel} className={`${styles.btn} ${styles.btnCancel}`}>
                Отмена
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className={`${styles.btn} ${styles.btnEdit}`}>
              Редактировать имя
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;