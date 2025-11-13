import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import ChangePasswordModal from './ChangePasswordModal';
import styles from './Profile.module.css';
import { FiEdit2, FiEyeOff } from 'react-icons/fi';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const avatarUrl = `${process.env.REACT_APP_SERVER_URL}/static/uploads/${user?.avatar_url || 'default_avatar.png'}`;

  const handleSave = async (field: 'name' | 'email') => {
    let payload: { name?: string; email?: string } = {};
    if (field === 'name' && name !== user?.name) {
      payload = { name };
    } else if (field === 'email' && email !== user?.email) {
      payload = { email };
    } else {
      setIsNameEditing(false);
      setIsEmailEditing(false);
      return;
    }

    try {
      const updatedUser = await authApi.updateProfile(payload);
      updateUser(updatedUser);
      addToast('Данные успешно обновлены!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Ошибка при сохранении', 'error');
      setName(user?.name || '');
      setEmail(user?.email || '');
    } finally {
      setIsNameEditing(false);
      setIsEmailEditing(false);
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const updatedUser = await authApi.uploadAvatar(formData);
      updateUser(updatedUser);
      addToast('Изображение профиля обновлено!', 'success');
    } catch (error) {
      addToast('Ошибка при загрузке изображения', 'error');
    }
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <>
      <div className={styles.profileContainer}>
        <h2 className={styles.title}>Личный кабинет</h2>
        <div className={styles.grid}>
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Имя</label>
              <div className={styles.inputWrapper}>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!isNameEditing} />
                {isNameEditing ? (
                  <button onClick={() => handleSave('name')} className={styles.saveIcon}>Сохранить</button>
                ) : (
                  <button onClick={() => setIsNameEditing(true)} className={styles.iconButton}>{FiEdit2({})}</button>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Почта</label>
              <div className={styles.inputWrapper}>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!isEmailEditing} />
                {isEmailEditing ? (
                  <button onClick={() => handleSave('email')} className={styles.saveIcon}>Сохранить</button>
                ) : (
                  <button onClick={() => setIsEmailEditing(true)} className={styles.iconButton}>{FiEdit2({})}</button>
                )}
              </div>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsPasswordModalOpen(true); }} className={styles.changePasswordLink}>
                    Хотите изменить пароль?
                </a>
            </div>
          </div>

          <div className={styles.avatarSection}>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
            <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
              <img src={avatarUrl} alt="Аватар" className={styles.avatar} />
              <span>Изменить изображение</span>
            </div>
          </div>
        </div>
      </div>
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </>
  );
};

export default Profile;