"use client";
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState('zones');
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#fafafa] dark:bg-[#121212] text-[#111518] dark:text-gray-100 font-sans antialiased m-0 p-0" suppressHydrationWarning>
        <Toaster position="top-right" />
        
        <header className="bg-[#232f3e] dark:bg-black text-white h-12 flex items-center justify-between px-4 text-sm font-medium">
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-wide cursor-pointer text-lg">aws</span>
            <div className="bg-[#19222d] px-3 py-1 rounded text-xs text-[#aab7c4]">Route 53 Console</div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={toggleDark} className="bg-[#3b4859] px-2 py-1 rounded hover:bg-gray-600">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <span>Piyush Tiwari @ MockAccount</span>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-48px)]">
          <nav className="w-64 bg-white dark:bg-[#1e1e1e] border-r border-[#eaeded] dark:border-gray-700 pt-4">
            <h1 className="px-6 pb-4 text-base font-bold text-[#232f3e] dark:text-white">Route 53</h1>
            {['Dashboard', 'zones', 'Health checks', 'Traffic policies', 'Resolver', 'Profiles'].map(item => (
              <div key={item} onClick={() => setView(item.toLowerCase())} className={`px-6 py-2.5 cursor-pointer hover:bg-[#f2f3f3] dark:hover:bg-gray-700 ${view === item.toLowerCase() ? 'bg-[#f2f3f3] dark:bg-gray-800 text-[#ec7211] font-bold border-l-2 border-[#ec7211]' : ''}`}>
                {item}
              </div>
            ))}
          </nav>
          
          <main className="flex-1 p-8 bg-[#fafafa] dark:bg-[#121212]">
            {view === 'zones' ? children : <div className="text-gray-500">Coming soon...</div>}
          </main>
        </div>
      </body>
    </html>
  );
}