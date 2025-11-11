import React from 'react';
import styles from './Button.module.css';
import { IconBaseProps } from 'react-icons';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'cta';
  Icon?: React.ComponentType<IconBaseProps>;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', Icon }) => {
  const buttonClass = `${styles.btn} ${styles[variant]}`;

  return (
    <button className={buttonClass} onClick={onClick}>
      {Icon && <Icon size={18} className={styles.icon} />}
      <span className={styles.text}>{children}</span>
    </button>
  );
};

export default Button;