import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'cta';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  const buttonClass = `${styles.btn} ${styles[variant]}`;

  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;