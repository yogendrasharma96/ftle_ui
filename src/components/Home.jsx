import React, { useState } from 'react'
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import { useDispatch } from 'react-redux';
import { setTheme } from '@/slice/utilitiesSlice';

const Home = () => {
  const [dark, setDark] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const dispatch = useDispatch();
  const toggleTheme = () => {
    dispatch(setTheme(!dark ? "dark" : "light"))
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen dark:bg-slate-900">
      <Navbar
        isDark={dark}
        toggleTheme={toggleTheme}
        onAuthOpen={() => setAuthOpen(true)}
      />

      <main>
        <Outlet />
      </main>

      <Footer />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );

}

export default Home