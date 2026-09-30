import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export const MainLayout = () => {
  const navigate = useNavigate();

  const handleNav = (page) => {
    if (page === 'home' || page === 'how-it-works') navigate('/');
    else if (page === 'login') navigate('/login');
    else if (page === 'signup') navigate('/signup');
    else navigate(`/${page}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNav} />
      <main className="flex-1">
        <Outlet context={{ onNavigate: handleNav }} />
      </main>
      <Footer onNavigate={handleNav} />
    </div>
  );
};

export default MainLayout;
