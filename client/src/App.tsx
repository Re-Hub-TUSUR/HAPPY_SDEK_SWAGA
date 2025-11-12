import React from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div>
          <LandingPage />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;