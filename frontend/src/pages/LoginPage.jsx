import React from 'react';
import Login from '@/components/forms/Login';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const handleLogin = () => {
    showToast('Login successful!', 'success');
  };

  return <Login onNavigate={(page) => navigate(`/${page}`)} onLogin={handleLogin} />;
}

