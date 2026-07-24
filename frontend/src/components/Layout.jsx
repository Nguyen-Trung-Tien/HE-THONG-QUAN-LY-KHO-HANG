import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import React, { useState } from 'react';
import { cn } from '../utils/cn';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-light/50 dark:bg-dark-bg/50 font-inter transition-colors duration-500">
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-text-primary/40 dark:bg-black/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-[60] transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 w-64 bg-white/50 dark:bg-dark-card/50 backdrop-blur-xl border-r border-border/50 dark:border-dark-border/40",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </aside>

        <main className="flex-1 overflow-y-auto relative z-10 p-3 sm:p-6 md:p-8 custom-scrollbar bg-transparent">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Outlet />
          </div>
        </main>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/2 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 dark:bg-accent/2 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Layout;
