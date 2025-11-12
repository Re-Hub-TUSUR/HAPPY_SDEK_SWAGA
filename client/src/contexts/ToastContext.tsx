import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Toast, { ToastProps, ToastType } from '../components/Toast/Toast';

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

interface ToastMessage extends Omit<ToastProps, 'onClose'> {}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = new Date().getTime().toString();
    setMessages((prevMessages) => [...prevMessages, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          {messages.map((msg) => (
            <Toast key={msg.id} {...msg} onClose={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}