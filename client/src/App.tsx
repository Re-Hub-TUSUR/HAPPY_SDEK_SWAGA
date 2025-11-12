import React from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div>
        <LandingPage />
      </div>
    </ToastProvider>
  );
}

export default App;