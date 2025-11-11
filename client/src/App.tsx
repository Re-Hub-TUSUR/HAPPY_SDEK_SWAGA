import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [healthMessage, setHealthMessage] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<string>('');

  useEffect(() => {
    // Проверка состояния бэкенда
    fetch('http://localhost:5000/api/v1/health')
      .then(res => res.json())
      .then(data => setHealthMessage(data.message || 'Ошибка'))
      .catch(() => setHealthMessage('Не удалось подключиться к бэкенду'));

    // Проверка состояния базы данных
    fetch('http://localhost:5000/api/v1/db-test')
      .then(res => res.json())
      .then(data => setDbStatus(data.status))
      .catch(() => setDbStatus('Ошибка подключения к БД'));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>CDEK: AI Burnout Prevention Tool</h1>
        <div className="status-container">
          <p>Статус бэкенда: <span>{healthMessage || 'Загрузка...'}</span></p>
          <p>Статус базы данных: <span>{dbStatus || 'Проверка...'}</span></p>
        </div>
      </header>
    </div>
  );
}

export default App;