import React from 'react';
import Navbar from './Navbar';
import ToastProvider from '../ui/Toast';

export default function PageWrapper({ children, showNavbar = true }) {
  return (
    <div className="min-h-screen bg-ethos-bg text-ethos-white flex flex-col">
      {showNavbar && <Navbar />}
      <main className={`flex-grow flex flex-col ${showNavbar ? 'pt-16' : ''}`}>
        {children}
      </main>
      <ToastProvider />
    </div>
  );
}
