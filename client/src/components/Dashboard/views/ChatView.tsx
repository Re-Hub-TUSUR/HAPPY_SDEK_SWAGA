import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatView.module.css';
import { chatApi } from '../../../services/chatService';
import { FiSend } from 'react-icons/fi'; // <-- НОВЫЙ ИМПОРТ

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const ChatView: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Привет! Я ваш корпоративный AI-психолог. Чем я могу вам помочь сегодня?', sender: 'ai' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const data = await chatApi.createNewSession();
        setSessionId(data.session_id);
      } catch (error) {
        setMessages(prev => [...prev, { text: 'Не удалось запустить сессию чата. Попробуйте перезагрузить страницу.', sender: 'ai' }]);
      }
    };
    startSession();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || isTyping) return;

    const newMessage: Message = { text: currentMessage, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(sessionId, currentMessage);
      const aiMessage: Message = { text: response.message, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { text: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.', sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2>AI-ассистент</h2>
      </div>
      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.message} ${styles.ai} ${styles.typing}`}>
            Ассистент печатает...
          </div>
        )}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="Напишите ваш вопрос..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isTyping || !sessionId}
        />
        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={isTyping || !sessionId || !currentMessage.trim()}
        >
          {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
          {FiSend({ size: 20 })}
        </button>
      </div>
    </div>
  );
};

export default ChatView;