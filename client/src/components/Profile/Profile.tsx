import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import ChangePasswordModal from './ChangePasswordModal';
import styles from './Profile.module.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = `${process.env.REACT_APP_SERVER_URL}/static/uploads/${user?.avatar_url || 'default_avatar.png'}`;
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const updatedUser = await authApi.uploadAvatar(formData);
      updateUser(updatedUser);
      addToast('Изображение профиля обновлено!', 'success');
    } catch (error: any)      {
      addToast(error.message || 'Ошибка при загрузке изображения', 'error');
    }
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }
  
  const fullName = `${user.last_name} ${user.first_name} ${user.patronymic || ''}`.trim();

  return (
    <>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
            <img src={avatarUrl} alt="Аватар" className={styles.avatar} />
            <span>Изменить</span>
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.fullName}>{fullName}</h1>
            <p className={styles.position}>{user.position || 'Должность не указана'}</p>
            <div className={styles.actions}>
              <button 
                type="button"
                onClick={() => setIsPasswordModalOpen(true)} 
                className={styles.changePasswordLink}
              >
                Сменить пароль
              </button>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3 className={styles.infoTitle}>Общая информация</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><label>Город</label><p>{user.city || '-'}</p></div>
            <div className={styles.infoItem}><label>Подразделение</label><p>{user.department || '-'}</p></div>
            <div className={styles.infoItem}><label>Статус</label><p>{user.is_manager ? 'Руководитель' : 'Сотрудник'}</p></div>
            <div className={styles.infoItem}><label>Стаж</label><p>{user.experience || '-'}</p></div>
            <div className={styles.infoItem}><label>Возраст</label><p>{user.age ? `${user.age} лет` : '-'}</p></div>
            <div className={styles.infoItem}><label>Email</label><p>{user.email}</p></div>
          </div>
        </div>
      </div>
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </>
  );
};

export default Profile;