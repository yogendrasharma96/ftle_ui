import React, { useState } from 'react'
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Dashboard from './Dashboard';

const Home = () => {
    const [dark, setDark] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
  
    const toggleTheme = () => {
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
          <Dashboard/>
          <Outlet/>
        </main>

        <Footer/>
  
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
        />
      </div>
    );
  
}

export default Home